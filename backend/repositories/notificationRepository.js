const pool = require('../config/db');

const notificationRepository = {
  // Create notification
  async createNotification(userId, title, message) {
    const result = await pool.query(
      `INSERT INTO notifications (user_id, title, message, is_read, created_at)
       VALUES ($1, $2, $3, FALSE, CURRENT_TIMESTAMP)
       RETURNING *`,
      [userId, title, message]
    );
    return result.rows[0];
  },

  // Get notifications for user
  async getNotificationsByUserId(userId, limit = 50, offset = 0) {
    const result = await pool.query(
      `SELECT * FROM notifications 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    
    const countResult = await pool.query(
      `SELECT COUNT(*), SUM(CASE WHEN is_read = FALSE THEN 1 ELSE 0 END) AS unread
       FROM notifications WHERE user_id = $1`,
      [userId]
    );

    return {
      notifications: result.rows,
      total: parseInt(countResult.rows[0].count || 0),
      unread: parseInt(countResult.rows[0].unread || 0)
    };
  },

  // Mark specific notification as read
  async markAsRead(id, userId) {
    const result = await pool.query(
      `UPDATE notifications SET is_read = TRUE 
       WHERE id = $1 AND user_id = $2 
       RETURNING *`,
      [id, userId]
    );
    return result.rows[0];
  },

  // Mark all notifications as read for user
  async markAllAsRead(userId) {
    const result = await pool.query(
      `UPDATE notifications SET is_read = TRUE 
       WHERE user_id = $1 AND is_read = FALSE
       RETURNING *`
    );
    return result.rows;
  },

  // Delete specific notification
  async deleteNotification(id, userId) {
    const result = await pool.query(
      `DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING *`,
      [id, userId]
    );
    return result.rows[0];
  }
};

module.exports = notificationRepository;
