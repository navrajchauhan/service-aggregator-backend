import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const MyBookings = () => {
  const { user, token } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchBookings = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/bookings/my-bookings', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBookings(res.data);
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user, token]);

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/bookings/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBookings(
        bookings.map((b) => (b._id === id ? { ...b, status } : b))
      );
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update status');
    }
  };

  if (!user) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <p>Please login first.</p>
    </div>
  );
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <p style={{ fontSize: '1.1rem', color: '#666' }}>Loading bookings...</p>
      </div>
    );
  }

  return (
    <div>
      <h2>My Bookings</h2>

      {bookings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '10px' }}>
          <h3 style={{ marginBottom: '10px' }}>No bookings yet</h3>
          <p style={{ color: '#666' }}>
            {user.role === 'consumer'
              ? 'You haven’t booked any services yet.'
              : 'You have no booking requests at the moment.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {bookings.map((booking) => (
            <div
              key={booking._id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '20px',
                background: '#f9f9f9',
              }}
            >
              <h3>{booking.service?.serviceType}</h3>
              <p><strong>Provider:</strong> {booking.provider?.name}</p>
              <p><strong>Date:</strong> {new Date(booking.date).toLocaleDateString()}</p>
              <p>
                <strong>Status:</strong>{' '}
                <span style={{ 
                  color: booking.status === 'confirmed' ? 'green' : 
                         booking.status === 'cancelled' ? 'red' : 'orange'
                }}>
                  {booking.status}
                </span>
              </p>

              {/* Provider can confirm or cancel */}
              {user.role === 'provider' && booking.status === 'pending' && (
                <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => updateStatus(booking._id, 'confirmed')}
                    style={{ background: 'green', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => updateStatus(booking._id, 'cancelled')}
                    style={{ background: '#e94560', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;