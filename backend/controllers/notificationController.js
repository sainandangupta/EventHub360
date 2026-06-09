const notificationService = require('../services/notificationService');

const notificationController = {
  // Get notifications for authenticated user
  async getMyNotifications(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const page = parseInt(req.query.page) || 1;
      const offset = (page - 1) * limit;

      const result = await notificationService.getMyNotifications(req.user.id, limit, offset);
      res.json({
        data: result.notifications,
        total: result.total,
        unread: result.unread,
        page,
        limit
      });
    } catch (err) {
      next(err);
    }
  },

  // Mark notification as read
  async markAsRead(req, res, next) {
    try {
      const { id } = req.params;
      const notification = await notificationService.markAsRead(id, req.user.id);
      if (!notification) {
        return res.status(404).json({ message: 'Notification not found or access denied' });
      }
      res.json({ message: 'Notification marked as read', data: notification });
    } catch (err) {
      next(err);
    }
  },

  // Mark all notifications as read
  async markAllAsRead(req, res, next) {
    try {
      await notificationService.markAllAsRead(req.user.id);
      res.json({ message: 'All notifications marked as read' });
    } catch (err) {
      next(err);
    }
  },

  // Delete notification
  async deleteNotification(req, res, next) {
    try {
      const { id } = req.params;
      const result = await notificationService.deleteNotification(id, req.user.id);
      if (!result) {
        return res.status(404).json({ message: 'Notification not found or access denied' });
      }
      res.json({ message: 'Notification deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = notificationController;
