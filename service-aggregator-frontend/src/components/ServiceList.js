import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { AuthContext } from '../context/AuthContext';

const ServiceList = () => {
  const { user, token } = useContext(AuthContext);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [bookingService, setBookingService] = useState(null);
  const [bookingDate, setBookingDate] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/services');
        setServices(res.data);
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  // Inject calendar styles
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
    return () => document.head.removeChild(style);
  }, []);

  const isDateBlocked = (service, date) => {
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

  const tileClassName = (service) => ({ date, view }) => {
    if (view === 'month' && isDateBlocked(service, date)) {
      return 'blocked-date';
    }
    return null;
  };

  const handleBook = async () => {
    if (!bookingDate) {
      setMessage('Please select a date');
      return;
    }
    if (isDateBlocked(bookingService, bookingDate)) {
      setMessage('This date is already booked');
      return;
    }

    try {
      await axios.post(
        'http://localhost:5000/api/bookings',
        { serviceId: bookingService._id, date: bookingDate },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('Booking request sent successfully!');
      setBookingService(null);
      setBookingDate(null);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Booking failed');
    }
  };

  const filteredServices = services.filter((service) =>
    filterType
      ? service.serviceType.toLowerCase().includes(filterType.toLowerCase())
      : true
  );

  if (loading) return <p>Loading services...</p>;

  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>All Services</h2>

      <div className="filter-bar">
        <input
          type="text"
          placeholder="Filter by service type..."
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        />
      </div>

      {message && (
        <p style={{ color: message.includes('success') ? 'green' : 'red', marginBottom: '15px' }}>
          {message}
        </p>
      )}

      {filteredServices.length === 0 ? (
        <p>No services found.</p>
      ) : (
        <div className="services-grid">
          {filteredServices.map((service) => (
            <div key={service._id} className="service-card">
              <h3>
                <Link
                  to={`/service/${service._id}`}
                  style={{ color: '#1a1a2e', textDecoration: 'none' }}
                >
                  {service.providerName} — {service.serviceType}
                </Link>
              </h3>

              {service.description && (
                <p style={{ color: '#555', marginBottom: '10px' }}>{service.description}</p>
              )}

              <div className="service-meta">
                {service.price && <span><strong>Price:</strong> ₹{service.price}</span>}
                {service.location && <span><strong>Location:</strong> {service.location}</span>}
                {service.contactNumber && <span><strong>Contact:</strong> {service.contactNumber}</span>}
              </div>

              {user?.role === 'consumer' && (
                <button
                  className="primary-btn"
                  onClick={() => {
                    setBookingService(service);
                    setBookingDate(null);
                    setMessage('');
                  }}
                >
                  Book Now
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Booking Modal with react-calendar */}
      {bookingService && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Book: {bookingService.serviceType}</h3>
            <p style={{ margin: '8px 0 16px' }}>Provider: {bookingService.providerName}</p>

            <div style={{ marginBottom: '16px' }}>
              <p style={{ marginBottom: '8px', fontWeight: 500 }}>Select a date:</p>
              <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '10px' }}>
                <span style={{ color: '#333' }}>■ White</span> = Available &nbsp;&nbsp;
                <span style={{ color: '#ef5350' }}>■ Red</span> = Booked / Blocked
              </p>

              <Calendar
                onChange={setBookingDate}
                value={bookingDate}
                tileClassName={tileClassName(bookingService)}
                minDate={new Date()}
              />
            </div>

            {bookingDate && isDateBlocked(bookingService, bookingDate) && (
              <p style={{ color: 'red', marginBottom: '12px' }}>
                This date is already booked. Please select another date.
              </p>
            )}

            {bookingDate && !isDateBlocked(bookingService, bookingDate) && (
              <p style={{ color: 'green', marginBottom: '12px' }}>
                Selected: {bookingDate.toLocaleDateString()}
              </p>
            )}

            <div className="form-actions">
              <button
                className="primary-btn"
                onClick={handleBook}
                disabled={!bookingDate || isDateBlocked(bookingService, bookingDate)}
              >
                Confirm Booking
              </button>
              <button
                onClick={() => {
                  setBookingService(null);
                  setBookingDate(null);
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

export default ServiceList;