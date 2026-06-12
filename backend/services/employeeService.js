const employeeRepository = require('../repositories/employeeRepository');
const auditLogger = require('../utils/auditLogger');
const AppError = require('../utils/AppError');

const employeeService = {
  // Create employee
  async createEmployee(userId, data, performedBy) {
    const { department_id, phone, address, designation, salary, skills, city, work_mode, status, joining_date } = data;
    const employee = await employeeRepository.createEmployee(
      userId,
      department_id,
      phone,
      address,
      designation,
      salary,
      city,
      work_mode,
      status,
      joining_date
    );

    if (skills && skills.length > 0) {
      await employeeRepository.addEmployeeSkills(employee.id, skills);
    }

    // Write audit log
    await auditLogger.log('employee_profiles', 'INSERT', employee.id, null, employee, performedBy);

    return employee;
  },

  // Get all employees with pagination, search, filter, sort
  async getAllEmployees(query = {}) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 20;
    const offset = (page - 1) * limit;
    const { rows, total } = await employeeRepository.getAllEmployees({
      search: query.search,
      department_id: query.department_id,
      city: query.city,
      work_mode: query.work_mode,
      status: query.status,
      limit,
      offset,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder
    });
    return { data: rows, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  // Get employee by ID
  async getEmployeeById(id) {
    const employee = await employeeRepository.getEmployeeById(id);
    if (!employee) return null;

    const skills = await employeeRepository.getEmployeeSkills(id);
    const images = await employeeRepository.getEmployeeImages(id);

    return {
      ...employee,
      skills,
      images
    };
  },

  // Update employee
  async updateEmployee(id, data, performedBy) {
    // Fetch old data for audit trail
    const oldEmployee = await employeeRepository.getEmployeeById(id);
    if (!oldEmployee) {
      throw AppError.notFound('Employee profile not found');
    }

    const { department_id, phone, address, designation, salary, skills, city, work_mode, status, joining_date } = data;
    const updatedEmployee = await employeeRepository.updateEmployee(
      id,
      department_id,
      phone,
      address,
      designation,
      salary,
      city,
      work_mode,
      status,
      joining_date
    );

    // Update skills: delete old and insert new
    await employeeRepository.deleteEmployeeSkills(id);
    if (skills && skills.length > 0) {
      await employeeRepository.addEmployeeSkills(id, skills);
    }

    // Clean old/new representations for audit logger
    const oldData = {
      department_id: oldEmployee.department_id,
      phone: oldEmployee.phone,
      address: oldEmployee.address,
      designation: oldEmployee.designation,
      salary: oldEmployee.salary,
      city: oldEmployee.city,
      work_mode: oldEmployee.work_mode,
      status: oldEmployee.status,
      joining_date: oldEmployee.joining_date
    };

    const newData = {
      department_id: updatedEmployee.department_id,
      phone: updatedEmployee.phone,
      address: updatedEmployee.address,
      designation: updatedEmployee.designation,
      salary: updatedEmployee.salary,
      city: updatedEmployee.city,
      work_mode: updatedEmployee.work_mode,
      status: updatedEmployee.status,
      joining_date: updatedEmployee.joining_date
    };

    // Log the JSONB difference in audit trail
    await auditLogger.log('employee_profiles', 'UPDATE', id, oldData, newData, performedBy);

    return updatedEmployee;
  },

  // Delete employee
  async deleteEmployee(id, performedBy) {
    const oldEmployee = await employeeRepository.getEmployeeById(id);
    if (!oldEmployee) {
      throw AppError.notFound('Employee profile not found');
    }

    // Delete relationships
    await employeeRepository.deleteEmployeeSkills(id);
    await employeeRepository.deleteEmployeeImages(id);
    
    // Delete profile
    const deletedEmployee = await employeeRepository.deleteEmployee(id);

    // Write audit log
    await auditLogger.log('employee_profiles', 'DELETE', id, oldEmployee, null, performedBy);

    return deletedEmployee;
  },

  // Upload employee images
  async uploadImages(employeeId, files) {
    if (!files || files.length === 0) {
      throw AppError.badRequest('No files provided');
    }

    const savedImages = [];
    for (let file of files) {
      const img = await employeeRepository.uploadEmployeeImage(employeeId, file.filename);
      savedImages.push(img);
    }

    return savedImages;
  },

  // Get dashboard statistics
  async getDashboardStats() {
    return employeeRepository.getDashboardStats();
  }
};

module.exports = employeeService;
