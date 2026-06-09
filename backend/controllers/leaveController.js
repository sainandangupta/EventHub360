const leaveService = require('../services/leaveService');

const leaveController = {
  // Get all leave types
  async getLeaveTypes(req, res) {
    try {
      const types = await leaveService.getLeaveTypes();
      res.json(types);
    } catch (err) {
      console.error('Get Leave Types Error:', err);
      res.status(500).json({ message: err.message });
    }
  },

  // Get current user's leave balance
  async getMyBalance(req, res) {
    try {
      const employeeId = await leaveService.getEmployeeIdByUserId(req.user.id);
      const year = req.query.year || new Date().getFullYear();
      const balance = await leaveService.getLeaveBalance(employeeId, year);
      res.json(balance);
    } catch (err) {
      console.error('Get Balance Error:', err);
      res.status(500).json({ message: err.message });
    }
  },

  // Apply for leave
  async applyLeave(req, res) {
    try {
      const result = await leaveService.applyLeave(req.user.id, req.body);
      res.status(201).json({ message: 'Leave application submitted successfully', data: result });
    } catch (err) {
      console.error('Apply Leave Error:', err);
      res.status(500).json({ message: err.message });
    }
  },

  // Get current user's leaves
  async getMyLeaves(req, res) {
    try {
      const leaves = await leaveService.getMyLeaves(req.user.id, req.query.status);
      res.json(leaves);
    } catch (err) {
      console.error('Get My Leaves Error:', err);
      res.status(500).json({ message: err.message });
    }
  },

  // Get leave by ID
  async getLeaveById(req, res) {
    try {
      const leave = await leaveService.getLeaveById(req.params.id);
      if (!leave) {
        return res.status(404).json({ message: 'Leave application not found' });
      }
      res.json(leave);
    } catch (err) {
      console.error('Get Leave By ID Error:', err);
      res.status(500).json({ message: err.message });
    }
  },

  // Cancel a leave application
  async cancelLeave(req, res) {
    try {
      const result = await leaveService.cancelLeave(req.params.id, req.user.id);
      if (!result) {
        return res.status(400).json({ message: 'Cannot cancel this leave. It may not exist, not belong to you, or is not in pending status.' });
      }
      res.json({ message: 'Leave application cancelled successfully', data: result });
    } catch (err) {
      console.error('Cancel Leave Error:', err);
      res.status(500).json({ message: err.message });
    }
  },

  // Get pending approvals
  async getPendingApprovals(req, res) {
    try {
      const pending = await leaveService.getPendingApprovals(req.user.id, req.user.role);
      res.json(pending);
    } catch (err) {
      console.error('Get Pending Approvals Error:', err);
      res.status(500).json({ message: err.message });
    }
  },

  // Approve or reject a leave
  async approveLeave(req, res) {
    try {
      const { action, remarks } = req.body;
      const result = await leaveService.approveLeave(req.params.id, req.user.id, req.user.role, action, remarks);
      res.json({ message: 'Leave application updated successfully', data: result });
    } catch (err) {
      console.error('Approve Leave Error:', err);
      res.status(500).json({ message: err.message });
    }
  },

  // Get approval history
  async getApprovalHistory(req, res) {
    try {
      const history = await leaveService.getApprovalHistory(req.params.id);
      res.json(history);
    } catch (err) {
      console.error('Get Approval History Error:', err);
      res.status(500).json({ message: err.message });
    }
  },

  // Get dashboard statistics
  async getDashboardStats(req, res) {
    try {
      const stats = await leaveService.getDashboardStats();
      res.json(stats);
    } catch (err) {
      console.error('Get Dashboard Stats Error:', err);
      res.status(500).json({ message: err.message });
    }
  },

  // Get reports by type
  async getReports(req, res) {
    try {
      const { type } = req.params;
      const { year } = req.query;
      const report = await leaveService.getReports(type, year);
      res.json(report);
    } catch (err) {
      console.error('Get Reports Error:', err);
      res.status(500).json({ message: err.message });
    }
  }
};

module.exports = leaveController;
