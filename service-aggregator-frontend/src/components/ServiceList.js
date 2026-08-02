import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ServiceList = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/services');
        setServices(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching services:', err.message);
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const filteredServices = services.filter((service) => {
    const typeMatch = filterType
      ? service.serviceType.toLowerCase().includes(filterType.toLowerCase())
      : true;

    const dateMatch = filterDate
      ? service.availability?.some(
          (a) => a.date?.startsWith(filterDate) && a.isAvailable
        )
      : true;

    return typeMatch && dateMatch;
  });

  if (loading) return <p>Loading services...</p>;

  return (
    <div>
      <h2>All Services</h2>

      {/* Filters */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '15px' }}>
        <input
          type="text"
          placeholder="Filter by service type..."
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          style={{ padding: '8px', width: '220px' }}
        />
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          style={{ padding: '8px' }}
        />
      </div>

      {filteredServices.length === 0 ? (
        <p>No services found.</p>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {filteredServices.map((service) => (
            <div
              key={service._id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '20px',
                background: '#f9f9f9',
              }}
            >
              <h3 style={{ margin: '0 0 8px 0' }}>
                {service.providerName} — {service.serviceType}
              </h3>

              {service.description && (
                <p style={{ margin: '0 0 10px 0', color: '#555' }}>
                  {service.description}
                </p>
              )}

              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                {service.price && (
                  <span>
                    <strong>Price:</strong> ₹{service.price}
                  </span>
                )}
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ServiceList;