const assetRepository = require('../repositories/assetRepository');
const employeeRepository = require('../repositories/employeeRepository');
const pool = require('../config/db');
const auditLogger = require('../utils/auditLogger');
const notificationService = require('./notificationService');
const emailService = require('./emailService');
const logger = require('../utils/logger');

const assetService = {
  // Create an asset
  async createAsset(data, performedBy) {
    const { asset_code, asset_name, asset_type, purchase_date, purchase_cost, status } = data;
    
    // Check duplicate code
    const existing = await assetRepository.getAssetByCode(asset_code);
    if (existing) {
      throw new Error(`Asset with code ${asset_code} already exists`);
    }

    const asset = await assetRepository.createAsset(
      asset_code,
      asset_name,
      asset_type,
      purchase_date,
      purchase_cost,
      status || 'Available'
    );

    // Audit log
    await auditLogger.log('assets', 'INSERT', asset.id, null, asset, performedBy);
    
    // History log
    await assetRepository.createHistoryEntry(asset.id, 'Asset Created', `Asset master file created with status ${asset.status}`, performedBy);

    return asset;
  },

  // Get list of assets
  async getAllAssets(filters) {
    return assetRepository.getAllAssets(filters);
  },

  // Get asset by ID with history
  async getAssetById(id) {
    const asset = await assetRepository.getAssetById(id);
    if (!asset) return null;

    const history = await assetRepository.getHistoryByAssetId(id);
    const activeAllocation = await assetRepository.getActiveAllocationByAssetId(id);
    
    let allocationDetails = null;
    if (activeAllocation) {
      allocationDetails = await assetRepository.getAllocationById(activeAllocation.id);
    }

    return {
      ...asset,
      activeAllocation: allocationDetails,
      history
    };
  },

  // Allocate asset to employee
  async allocateAsset(assetId, employeeId, allocatedBy, returnDate) {
    const asset = await assetRepository.getAssetById(assetId);
    if (!asset) {
      throw new Error('Asset not found');
    }

    if (asset.status !== 'Available') {
      throw new Error(`Asset is not available for allocation. Current status: ${asset.status}`);
    }

    const employee = await employeeRepository.getEmployeeById(employeeId);
    if (!employee) {
      throw new Error('Employee profile not found');
    }

    // Save previous state for audit log
    const oldAssetData = { status: asset.status };

    // Update asset status to Allocated
    const updatedAsset = await assetRepository.updateAssetStatus(assetId, 'Allocated');
    const newAssetData = { status: updatedAsset.status };

    // Create allocation record
    const allocation = await assetRepository.createAllocation(assetId, employeeId, allocatedBy, returnDate);

    // Audit logs
    await auditLogger.log('assets', 'UPDATE', assetId, oldAssetData, newAssetData, allocatedBy);
    await auditLogger.log('asset_allocations', 'INSERT', allocation.id, null, allocation, allocatedBy);

    // History log
    await assetRepository.createHistoryEntry(
      assetId,
      'Asset Allocated',
      `Asset assigned to employee ${employee.name} (ID: ${employee.id}) by user ID ${allocatedBy}. Return target: ${returnDate || 'N/A'}`,
      allocatedBy
    );

    // Trigger notification to the employee (employee.user_id refers to users.id)
    try {
      const message = `${asset.asset_name} Assigned Successfully`;
      await notificationService.createNotification(
        employee.user_id,
        'Asset Assigned',
        message
      );
    } catch (err) {
      logger.error('Failed to send asset allocation notification:', err);
    }

    if (employee.email) {
      emailService.sendAssetAssignedEmail(employee.email, employee.name, asset.asset_name).catch(() => {});
    }

    return { asset: updatedAsset, allocation };
  },

  // Return an allocated asset
  async returnAsset(allocationId, performedBy, remarks) {
    const allocation = await assetRepository.getAllocationById(allocationId);
    if (!allocation) {
      throw new Error('Allocation record not found');
    }

    if (allocation.status !== 'Allocated') {
      throw new Error(`Allocation is already in '${allocation.status}' state`);
    }

    const assetId = allocation.asset_id;
    const asset = await assetRepository.getAssetById(assetId);
    if (!asset) {
      throw new Error('Asset not found');
    }

    // Fetch employee detail to get employee user_id
    const employee = await employeeRepository.getEmployeeById(allocation.employee_id);

    // Save states for audit logging
    const oldAssetData = { status: asset.status };
    const oldAllocData = { status: allocation.status, return_date: allocation.return_date };

    // Update asset status back to Available
    const updatedAsset = await assetRepository.updateAssetStatus(assetId, 'Available');
    const newAssetData = { status: updatedAsset.status };

    // Close allocation record
    const currentDate = new Date().toISOString().split('T')[0];
    const updatedAllocation = await assetRepository.updateAllocationReturn(allocationId, currentDate, 'Returned');
    const newAllocData = { status: updatedAllocation.status, return_date: updatedAllocation.return_date };

    // Write audit logs
    await auditLogger.log('assets', 'UPDATE', assetId, oldAssetData, newAssetData, performedBy);
    await auditLogger.log('asset_allocations', 'UPDATE', allocationId, oldAllocData, newAllocData, performedBy);

    // History log
    await assetRepository.createHistoryEntry(
      assetId,
      'Asset Returned',
      `Asset returned by employee ${allocation.employee_name}. Remarks: ${remarks || 'None'}`,
      performedBy
    );

    // Trigger notification
    if (employee) {
      try {
        const message = `${asset.asset_name} Returned Successfully`;
        await notificationService.createNotification(
          employee.user_id,
          'Asset Returned',
          message
        );
      } catch (err) {
        logger.error('Failed to send asset return notification:', err);
      }
    }

    return { asset: updatedAsset, allocation: updatedAllocation };
  },

  // Change asset status directly (e.g. damaged, lost)
  async updateAssetStatus(assetId, status, remarks, performedBy) {
    const asset = await assetRepository.getAssetById(assetId);
    if (!asset) {
      throw new Error('Asset not found');
    }

    // Check if it is currently allocated. If allocated, we shouldn't change status to available without a return flow, but we can set it to Damaged or Lost.
    // If it is Damaged or Lost, we should close active allocations if they exist
    const activeAlloc = await assetRepository.getActiveAllocationByAssetId(assetId);
    if (activeAlloc && (status === 'Damaged' || status === 'Lost')) {
      // Return first
      const currentDate = new Date().toISOString().split('T')[0];
      await assetRepository.updateAllocationReturn(activeAlloc.id, currentDate, 'Returned');
    }

    const oldAssetData = { status: asset.status };
    const updatedAsset = await assetRepository.updateAssetStatus(assetId, status);
    const newAssetData = { status: updatedAsset.status };

    // Write audit log
    await auditLogger.log('assets', 'UPDATE', assetId, oldAssetData, newAssetData, performedBy);

    // History log
    await assetRepository.createHistoryEntry(
      assetId,
      'Status Changed',
      `Asset status updated manually to '${status}'. Remarks: ${remarks || 'None'}`,
      performedBy
    );

    return updatedAsset;
  },

  // Get asset report
  async getAssetReport() {
    return assetRepository.getAssetReportData();
  }
};

module.exports = assetService;
