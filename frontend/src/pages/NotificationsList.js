import React, { useState, useEffect } from 'react';
import api from '../api';

export default function NotificationsList() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  const fetchNotifications = () => {
    setLoading(true);
    api.get('/api/notifications', {
      headers: { Authorization: token }
    })
      .then(res => {
        setNotifications(res.data.data);
        setUnreadCount(res.data.unread);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch notifications');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleMarkRead = (id) => {
    api.put(`/api/notifications/${id}/read`, {}, {
      headers: { Authorization: token }
    })
      .then(() => {
        fetchNotifications();
      })
      .catch(err => {
        alert('Failed to update notification');
      });
  };

  const handleMarkAllRead = () => {
    api.put('/api/notifications/mark-all', {}, {
      headers: { Authorization: token }
    })
      .then(() => {
        fetchNotifications();
      })
      .catch(err => {
        alert('Failed to update all notifications');
      });
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this notification?')) return;
    api.delete(`/api/notifications/${id}`, {
      headers: { Authorization: token }
    })
      .then(() => {
        fetchNotifications();
      })
      .catch(err => {
        alert('Failed to delete notification');
      });
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
        <h2>🔔 My Notifications ({unreadCount} unread)</h2>
        {unreadCount > 0 && (
          <button 
            onClick={handleMarkAllRead} 
            style={{ padding: '8px 12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Mark All as Read
          </button>
        )}
      </div>

      {error && <div style={{ color: 'red', marginBottom: '15px' }}>⚠️ {error}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '30px' }}>Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', border: '1px dashed #ccc', borderRadius: '4px', color: '#666' }}>
          No notifications yet! You will get alerts for leave approvals and asset assignments here.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {notifications.map(notif => (
            <div 
              key={notif.id} 
              style={{ 
                padding: '15px', 
                border: '1px solid #ddd', 
                borderRadius: '6px', 
                backgroundColor: notif.is_read ? '#f9f9f9' : '#e6f3ff', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
            >
              <div>
                <h4 style={{ margin: '0 0 5px 0', color: '#333', fontSize: '16px', fontWeight: notif.is_read ? 'normal' : 'bold' }}>
                  {notif.title} {!notif.is_read && <span style={{ backgroundColor: '#ffc107', color: '#000', fontSize: '10px', padding: '2px 5px', borderRadius: '3px', marginLeft: '5px', fontWeight: 'bold' }}>NEW</span>}
                </h4>
                <p style={{ margin: '0 0 5px 0', color: '#555', fontSize: '14px' }}>{notif.message}</p>
                <small style={{ color: '#888', fontSize: '11px' }}>{new Date(notif.created_at).toLocaleString()}</small>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                {!notif.is_read && (
                  <button 
                    onClick={() => handleMarkRead(notif.id)} 
                    style={{ padding: '5px 10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '12px' }}
                  >
                    Read
                  </button>
                )}
                <button 
                  onClick={() => handleDelete(notif.id)} 
                  style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '12px' }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
