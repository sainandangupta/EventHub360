const notificationRepository = require('../repositories/notificationRepository');

const notificationService = {
  // Dispatch notification
  async createNotification(userId, title, message) {
    if (!userId) {
      throw new Error('User ID is required to dispatch notifications');
    }
    return notificationRepository.createNotification(userId, title, message);
  },

  // Retrieve notifications
  async getMyNotifications(userId, limit, offset) {
    return notificationRepository.getNotificationsByUserId(userId, limit, offset);
  },

  // Mark specific notification as read
  async markAsRead(id, userId) {
    return notificationRepository.markAsRead(id, userId);
  },

  // Mark all notifications as read
  async markAllAsRead(userId) {
    return notificationRepository.markAllAsRead(userId);
  },

  // Delete notification
  async deleteNotification(id, userId) {
    return notificationRepository.deleteNotification(id, userId);
  }
};

module.exports = notificationService;
