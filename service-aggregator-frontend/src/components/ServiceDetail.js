import { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { AuthContext } from '../context/AuthContext';
import API from '../api';

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext);

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingDate, setBookingDate] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [message, setMessage] = useState('');
  const [showBooking, setShowBooking] = useState(false);

  // Force calendar styles
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .react-calendar__tile {
        background-color: white !important;
        color: #333 !important;
        border-radius: 6px !important;
      }
      .react-calendar__tile:enabled:hover {
        background-color: #f0f0f0 !important;
      }
      .react-calendar__tile.blocked-date {
        background-color: #ef5350 !important;
        color: white !important;
        font-weight: 600 !important;
      }
      .react-calendar__tile.blocked-date:enabled:hover {
        background-color: #e53935 !important;
        color: white !important;
      }
      .react-calendar__tile--active {
        background-color: #1a1a2e !important;
        color: white !important;
      }
      .react-calendar__tile--now {
        background-color: #fff9c4 !important;
        border: 2px solid #fbc02d !important;
      }
      .react-calendar__tile--now.blocked-date {
        background-color: #ef5350 !important;
        border: 2px solid #c62828 !important;
        color: white !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const res = await API.get('/api/services');
        const found = res.data.find((s) => s._id === id);

        if (!found) {
          setError('Service not found');
        } else {
          setService(found);
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to load service');
        setLoading(false);
      }
    };

    fetchService();
  }, [id]);

  const isDateBlocked = (date) => {
    if (!service?.availability || !date) return false;

    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    return service.availability.some((a) => {
      if (a.isAvailable !== false) return false;

      const blocked = new Date(a.date);
      blocked.setHours(0, 0, 0, 0);

      return blocked.getTime() === checkDate.getTime();
    });
  };

  const tileClassName = ({ date, view }) => {
    if (view === 'month' && isDateBlocked(date)) {
      return 'blocked-date';
    }
    return null;
  };

  const handleBook = async () => {
    if (!bookingDate) {
      setMessage('Please select a date');
      return;
    }

    if (isDateBlocked(bookingDate)) {
      setMessage('This date is already booked');
      return;
    }

    if (service.packages?.length > 0 && !selectedPackage) {
      setMessage('Please select a package');
      return;
    }

    try {
      await API.post(
        '/api/bookings',
        {
          serviceId: service._id,
          date: bookingDate,
          selectedPackage,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage('Booking request sent successfully!');
      setShowBooking(false);
      setBookingDate(null);
      setSelectedPackage(null);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Booking failed');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <p style={{ fontSize: '1.1rem', color: '#666' }}>
          Loading service details...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <p style={{ color: 'red' }}>{error}</p>
        <button
          onClick={() => navigate(-1)}
          style={{ marginTop: '15px' }}
          className="primary-btn"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!service) return null;

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#1a1a2e',
          cursor: 'pointer',
          marginBottom: '20px',
          fontSize: '1rem',
        }}
      >
        ← Back
      </button>

      <div className="service-card" style={{ maxWidth: '750px' }}>
        <h2 style={{ marginBottom: '6px' }}>{service.serviceType}</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Provided by <strong>{service.providerName}</strong>
        </p>

        {service.description && (
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ marginBottom: '6px' }}>Description</h4>
            <p style={{ color: '#555' }}>{service.description}</p>
          </div>
        )}

        {/* Packages display */}
        {service.packages && service.packages.length > 0 ? (
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ marginBottom: '10px' }}>Packages</h4>
            <div style={{ display: 'grid', gap: '10px' }}>
              {service.packages.map((pkg, index) => (
                <div
                  key={index}
                  style={{
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    background: '#fafafa',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: '10px',
                    }}
                  >
                    <strong>{pkg.name}</strong>
                    <span>₹{pkg.price}</span>
                  </div>
                  {pkg.description && (
                    <p
                      style={{
                        margin: '6px 0 0',
                        color: '#555',
                        fontSize: '0.95rem',
                      }}
                    >
                      {pkg.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : service.price ? (
          <div style={{ marginBottom: '24px' }}>
            <strong>Price:</strong> ₹{service.price}
          </div>
        ) : null}

        {/* Images carousel */}
        {((service.images && service.images.length > 0) || service.image) && (
          <div style={{ marginBottom: '24px' }}>
            <div
              style={{
                display: 'flex',
                overflowX: 'auto',
                gap: '12px',
                paddingBottom: '8px',
              }}
            >
              {(service.images && service.images.length > 0
                ? service.images
                : [service.image]
              ).map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`${service.serviceType} ${index + 1}`}
                  style={{
                    width: '100%',
                    maxWidth: '420px',
                    height: '260px',
                    objectFit: 'cover',
                    borderRadius: '10px',
                    flexShrink: 0,
                  }}
                />
              ))}
            </div>
            {service.images?.length > 1 && (
              <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '6px' }}>
                Scroll to see more images →
              </p>
            )}
          </div>
        )}

        <div className="service-meta" style={{ marginBottom: '28px' }}>
          {service.location && (
            <span>
              <strong>Location:</strong> {service.location}
            </span>
          )}
          {service.contactNumber && (
            <span>
              <strong>Contact:</strong> {service.contactNumber}
            </span>
          )}
        </div>

        {/* Availability Calendar */}
        <div style={{ marginBottom: '28px' }}>
          <h4 style={{ marginBottom: '12px' }}>Availability Calendar</h4>
          <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '12px' }}>
            <span style={{ color: '#333' }}>■ White</span> = Available &nbsp;&nbsp;
            <span style={{ color: '#ef5350' }}>■ Red</span> = Booked / Blocked
          </p>

          <div style={{ maxWidth: '350px' }}>
            <Calendar tileClassName={tileClassName} minDate={new Date()} />
          </div>
        </div>

        {message && (
          <p
            style={{
              color: message.includes('success') ? 'green' : 'red',
              marginBottom: '16px',
            }}
          >
            {message}
          </p>
        )}

        {user?.role === 'consumer' && (
          <button
            className="primary-btn"
            onClick={() => {
              setShowBooking(true);
              setBookingDate(null);
              setSelectedPackage(null);
              setMessage('');
            }}
          >
            Book This Service
          </button>
        )}

        {!user && (
          <p>
            <Link to="/login" style={{ color: '#4cc9f0' }}>
              Login
            </Link>{' '}
            as a consumer to book this service.
          </p>
        )}
      </div>

      {/* Booking Modal */}
      {showBooking && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Book: {service.serviceType}</h3>
            <p style={{ margin: '8px 0 16px' }}>
              Provider: {service.providerName}
            </p>

            {/* Package selection */}
            {service.packages && service.packages.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <p style={{ marginBottom: '8px', fontWeight: 500 }}>
                  Select a package:
                </p>
                <div style={{ display: 'grid', gap: '8px' }}>
                  {service.packages.map((pkg, index) => (
                    <label
                      key={index}
                      style={{
                        display: 'block',
                        border:
                          selectedPackage?.name === pkg.name &&
                          Number(selectedPackage?.price) === Number(pkg.price)
                            ? '2px solid #1a1a2e'
                            : '1px solid #ddd',
                        borderRadius: '8px',
                        padding: '10px 12px',
                        cursor: 'pointer',
                        background: '#fafafa',
                      }}
                    >
                      <input
                        type="radio"
                        name="package"
                        checked={
                          selectedPackage?.name === pkg.name &&
                          Number(selectedPackage?.price) === Number(pkg.price)
                        }
                        onChange={() => setSelectedPackage(pkg)}
                        style={{ marginRight: '8px' }}
                      />
                      <strong>{pkg.name}</strong> — ₹{pkg.price}
                      {pkg.description && (
                        <div
                          style={{
                            fontSize: '0.9rem',
                            color: '#555',
                            marginTop: '4px',
                          }}
                        >
                          {pkg.description}
                        </div>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <p style={{ marginBottom: '8px', fontWeight: 500 }}>
                Select a date:
              </p>
              <p
                style={{
                  fontSize: '0.85rem',
                  color: '#666',
                  marginBottom: '10px',
                }}
              >
                <span style={{ color: '#333' }}>■ White</span> = Available
                &nbsp;&nbsp;
                <span style={{ color: '#ef5350' }}>■ Red</span> = Booked /
                Blocked
              </p>

              <Calendar
                onChange={setBookingDate}
                value={bookingDate}
                tileClassName={tileClassName}
                minDate={new Date()}
              />
            </div>

            {bookingDate && isDateBlocked(bookingDate) && (
              <p style={{ color: 'red', marginBottom: '12px' }}>
                This date is already booked. Please select another date.
              </p>
            )}

            {bookingDate && !isDateBlocked(bookingDate) && (
              <p style={{ color: 'green', marginBottom: '12px' }}>
                Selected: {bookingDate.toLocaleDateString()}
              </p>
            )}

            <div className="form-actions">
              <button
                className="primary-btn"
                onClick={handleBook}
                disabled={
                  !bookingDate ||
                  isDateBlocked(bookingDate) ||
                  (service.packages?.length > 0 && !selectedPackage)
                }
              >
                Confirm Booking
              </button>
              <button
                onClick={() => {
                  setShowBooking(false);
                  setBookingDate(null);
                  setSelectedPackage(null);
                  setMessage('');
                }}
                style={{
                  padding: '9px 18px',
                  borderRadius: '5px',
                  border: '1px solid #ccc',
                  background: '#f5f5f5',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceDetail;