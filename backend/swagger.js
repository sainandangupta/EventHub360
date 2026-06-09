const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Employee Leave Management System API',
      version: '1.0.0',
      description: 'API documentation for the Employee Leave Management & Approval Workflow System',
    },
    servers: [{ url: 'http://localhost:5000', description: 'Development server' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'apiKey', in: 'header', name: 'Authorization', description: 'JWT token' }
      },
      schemas: {
        LeaveApplication: {
          type: 'object',
          properties: {
            leave_type_id: { type: 'integer', description: 'Leave type ID' },
            from_date: { type: 'string', format: 'date' },
            to_date: { type: 'string', format: 'date' },
            total_days: { type: 'integer', minimum: 1 },
            reason: { type: 'string', maxLength: 500 }
          },
          required: ['leave_type_id', 'from_date', 'to_date', 'total_days', 'reason']
        },
        ApproveLeave: {
          type: 'object',
          properties: {
            action: { type: 'string', enum: ['manager_approved', 'manager_rejected', 'hr_approved', 'hr_rejected'] },
            remarks: { type: 'string', maxLength: 500 }
          },
          required: ['action']
        }
      }
    }
  },
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = { swaggerUi, swaggerSpec };
