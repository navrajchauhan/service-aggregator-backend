import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ServiceList = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [serviceType, setServiceType] = useState('');

  const fetchServices = async (date = '', type = '') => {
    setLoading(true);

    try {
      let url = 'http://localhost:5000/api/services';
      const params = [];

      if (date) params.push(`date=${date}`);
      if (type) params.push(`serviceType=${type}`);

      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }

      const res = await axios.get(url);
      setServices(res.data);
    } catch (err) {
      console.error("Error fetching services:", err.message);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    fetchServices(date, serviceType);
  };

  const handleTypeChange = (e) => {
    const type = e.target.value;
    setServiceType(type);
    fetchServices(selectedDate, type);
  };

  if (loading) return <p>Loading services...</p>;

  return (
    <div>
      <h2>Service Listings</h2>

      {/* Date Filter */}
      <label>Select Date:</label><br />
      <input type="date" value={selectedDate} onChange={handleDateChange} />

      <br /><br />

      {/* Service Type Filter */}
      <label>Select Service Type:</label><br />
      <select value={serviceType} onChange={handleTypeChange}>
        <option value="">All</option>
        <option value="caterer">Caterer</option>
        <option value="florist">Florist</option>
        <option value="photographer">Photographer</option>
      </select>

      <br /><br />

      {services.length === 0 ? (
        <p>No services found.</p>
      ) : (
        <ul>
          {services.map(service => (
            <li key={service._id}>
              <strong>{service.providerName}</strong> - {service.serviceType}<br />
              {service.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ServiceList;