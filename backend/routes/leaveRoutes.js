const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { applyLeaveSchema, approveLeaveSchema } = require('../validators/leave.validator');
const leaveController = require('../controllers/leaveController');

/**
 * @swagger
 * /api/leave/types:
 *   get:
 *     summary: Get all leave types
 *     tags: [Leave]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of leave types
 */
router.get('/types', protect, leaveController.getLeaveTypes);

/**
 * @swagger
 * /api/leave/balance:
 *   get:
 *     summary: Get current user's leave balance
 *     tags: [Leave]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Year for balance lookup
 *     responses:
 *       200:
 *         description: Leave balance details
 */
router.get('/balance', protect, leaveController.getMyBalance);

/**
 * @swagger
 * /api/leave/apply:
 *   post:
 *     summary: Apply for leave
 *     tags: [Leave]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LeaveApplication'
 *     responses:
 *       201:
 *         description: Leave application submitted
 *       400:
 *         description: Validation error
 */
router.post('/apply', protect, authorize(['user', 'manager']), validate(applyLeaveSchema), leaveController.applyLeave);

/**
 * @swagger
 * /api/leave/my-leaves:
 *   get:
 *     summary: Get current user's leave applications
 *     tags: [Leave]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: List of leave applications
 */
router.get('/my-leaves', protect, leaveController.getMyLeaves);
router.get('/search', protect, authorize(['hr', 'admin']), leaveController.searchLeaves);

/**
 * @swagger
 * /api/leave/dashboard-stats:
 *   get:
 *     summary: Get leave dashboard statistics
 *     tags: [Leave]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 */
router.get('/dashboard-stats', protect, leaveController.getDashboardStats);

/**
 * @swagger
 * /api/leave/pending:
 *   get:
 *     summary: Get pending leave approvals
 *     tags: [Leave]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending leave applications
 */
router.get('/pending', protect, authorize(['manager', 'hr']), leaveController.getPendingApprovals);

/**
 * @swagger
 * /api/leave/reports/{type}:
 *   get:
 *     summary: Get leave reports
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [employee-wise, department-wise, monthly-trend, most-absent, leave-balance, rankings]
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Report data
 */
router.get('/reports/:type', protect, (req, res, next) => {
  if (req.params.type === 'leave-balance') {
    return next();
  }
  return authorize(['hr', 'admin'])(req, res, next);
}, leaveController.getReports);

/**
 * @swagger
 * /api/leave/{id}:
 *   get:
 *     summary: Get leave application by ID
 *     tags: [Leave]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Leave application details
 *       404:
 *         description: Not found
 */
router.get('/:id', protect, leaveController.getLeaveById);

/**
 * @swagger
 * /api/leave/{id}/history:
 *   get:
 *     summary: Get approval history for a leave application
 *     tags: [Leave]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Approval history
 */
router.get('/:id/history', protect, leaveController.getApprovalHistory);

/**
 * @swagger
 * /api/leave/{id}/cancel:
 *   put:
 *     summary: Cancel a leave application
 *     tags: [Leave]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Leave cancelled
 *       400:
 *         description: Cannot cancel
 */
router.put('/:id/cancel', protect, leaveController.cancelLeave);

/**
 * @swagger
 * /api/leave/{id}/approve:
 *   put:
 *     summary: Approve or reject a leave application
 *     tags: [Leave]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApproveLeave'
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Leave updated
 */
router.put('/:id/approve', protect, authorize(['manager', 'hr']), validate(approveLeaveSchema), leaveController.approveLeave);

module.exports = router;
