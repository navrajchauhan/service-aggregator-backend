import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const NotificationBell = () => {
  const { token } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const [listRes, countRes] = await Promise.all([
        axios.get('http://localhost:5000/api/notifications', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get('http://localhost:5000/api/notifications/unread-count', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setNotifications(listRes.data);
      setUnreadCount(countRes.data.count);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000); // refresh every 15s
      return () => clearInterval(interval);
    }
  }, [token]);

  const markAsRead = async (id) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/notifications/${id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.patch(
        'http://localhost:5000/api/notifications/read-all',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  if (!token) return null;

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'white',
          fontSize: '1.3rem',
          cursor: 'pointer',
          position: 'relative',
        }}
      >
        🔔
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-6px',
              right: '-8px',
              background: '#e94560',
              color: 'white',
              fontSize: '0.7rem',
              borderRadius: '50%',
              width: '18px',
              height: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: '40px',
            width: '320px',
            maxHeight: '400px',
            overflowY: 'auto',
            background: 'white',
            borderRadius: '10px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            zIndex: 1000,
            color: '#333',
          }}
        >
          <div
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid #eee',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <strong>Notifications</strong>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#4cc9f0',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <p style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
              No notifications
            </p>
          ) : (
            notifications.map((n) => (
              <div
                key={n._id}
                onClick={() => !n.isRead && markAsRead(n._id)}
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid #f0f0f0',
                  background: n.isRead ? 'white' : '#f0f9ff',
                  cursor: 'pointer',
                }}
              >
                <p style={{ margin: 0, fontSize: '0.9rem' }}>{n.message}</p>
                <small style={{ color: '#888' }}>
                  {new Date(n.createdAt).toLocaleString()}
                </small>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;