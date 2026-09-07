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
      <h2 style={{ marginBottom: '20px' }}>My Bookings</h2>

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
          {bookings.map((booking) => {
            const serviceDeleted = !booking.service;

            return (
              <div
                key={booking._id}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '20px',
                  background: serviceDeleted ? '#fff5f5' : '#f9f9f9',
                }}
              >
                <h3 style={{ margin: '0 0 8px 0' }}>
                  {serviceDeleted ? (
                    <span style={{ color: '#c62828' }}>Service no longer available</span>
                  ) : (
                    booking.service.serviceType
                  )}
                </h3>

                {!serviceDeleted && (
                  <>
                    <p style={{ margin: '4px 0' }}>
                      <strong>Provider:</strong> {booking.provider?.name || 'N/A'}
                    </p>
                    {booking.service.price && (
                      <p style={{ margin: '4px 0' }}>
                        <strong>Price:</strong> ₹{booking.service.price}
                      </p>
                    )}
                  </>
                )}

                <p style={{ margin: '4px 0' }}>
                  <strong>Date:</strong> {new Date(booking.date).toLocaleDateString()}
                </p>

                <p style={{ margin: '4px 0' }}>
                  <strong>Status:</strong>{' '}
                  <span
                    style={{
                      color:
                        booking.status === 'confirmed'
                          ? 'green'
                          : booking.status === 'cancelled'
                          ? 'red'
                          : 'orange',
                      fontWeight: 600,
                    }}
                  >
                    {booking.status}
                  </span>
                </p>

                {/* Show cancellation reason */}
                {booking.status === 'cancelled' && (
                  <p style={{ color: '#c62828', fontSize: '0.9rem', marginTop: '6px' }}>
                    Reason: {booking.cancellationReason || 'No reason provided'}
                  </p>
                )}

                {/* Provider actions */}
                {user.role === 'provider' && booking.status === 'pending' && !serviceDeleted && (
                  <div style={{ marginTop: '12px', display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => updateStatus(booking._id, 'confirmed')}
                      style={{
                        background: 'green',
                        color: 'white',
                        border: 'none',
                        padding: '8px 14px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => updateStatus(booking._id, 'cancelled')}
                      style={{
                        background: '#e94560',
                        color: 'white',
                        border: 'none',
                        padding: '8px 14px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyBookings;