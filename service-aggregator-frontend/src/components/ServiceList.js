import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const ServiceList = () => {
  const { user, token } = useContext(AuthContext);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [bookingService, setBookingService] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
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

  const isDateBlocked = (service, date) => {
    if (!service.availability) return false;
    const dateStr = new Date(date).toDateString();
    return service.availability.some(
      (a) => new Date(a.date).toDateString() === dateStr && a.isAvailable === false
    );
  };

  const handleBook = async () => {
    if (!bookingDate) {
      setMessage('Please select a date');
      return;
    }

    if (isDateBlocked(bookingService, bookingDate)) {
      setMessage('This date is already booked. Please choose another date.');
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
      setBookingDate('');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Booking failed');
    }
  };

  const filteredServices = services.filter((service) =>
    filterType ? service.serviceType.toLowerCase().includes(filterType.toLowerCase()) : true
  );

  if (loading) return <p>Loading services...</p>;

  return (
    <div>
      <h2>All Services</h2>

      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Filter by service type..."
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          style={{ padding: '8px', width: '250px' }}
        />
      </div>

      {message && (
        <p style={{ color: message.includes('success') ? 'green' : 'red' }}>{message}</p>
      )}

      {filteredServices.length === 0 ? (
        <p>No services found.</p>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {filteredServices.map((service) => (
            <div key={service._id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', background: '#f9f9f9' }}>
              <h3 style={{ margin: '0 0 8px 0' }}>
                {service.providerName} — {service.serviceType}
              </h3>

              {service.description && (
                <p style={{ margin: '0 0 10px 0', color: '#555' }}>{service.description}</p>
              )}

              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '15px' }}>
                {service.price && <span><strong>Price:</strong> ₹{service.price}</span>}
                {service.location && <span><strong>Location:</strong> {service.location}</span>}
                {service.contactNumber && <span><strong>Contact:</strong> {service.contactNumber}</span>}
              </div>

              {user?.role === 'consumer' && (
                <button
                  onClick={() => {
                    setBookingService(service);
                    setBookingDate('');
                    setMessage('');
                  }}
                  style={{ background: '#1a1a2e', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Book Now
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      {bookingService && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '10px', width: '400px' }}>
            <h3>Book: {bookingService.serviceType}</h3>
            <p>Provider: {bookingService.providerName}</p>

            <label style={{ display: 'block', marginTop: '15px' }}>Select Date:</label>
            <input
              type="date"
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              style={{ width: '100%', padding: '10px', margin: '10px 0' }}
            />

            {bookingDate && isDateBlocked(bookingService, bookingDate) && (
              <p style={{ color: 'red' }}>This date is already booked.</p>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button
                onClick={handleBook}
                disabled={bookingDate && isDateBlocked(bookingService, bookingDate)}
                style={{ background: '#1a1a2e', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}
              >
                Confirm Booking
              </button>
              <button
                onClick={() => {
                  setBookingService(null);
                  setBookingDate('');
                  setMessage('');
                }}
                style={{ background: '#ccc', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}
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