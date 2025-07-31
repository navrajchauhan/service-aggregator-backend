import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ServiceList = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/services');
        setServices(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching services:", err.message);
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  if (loading) return <p>Loading services...</p>;

  return (
    <div>
      <h2>All Services</h2>
      {services.length === 0 ? (
        <p>No services found.</p>
      ) : (
        <ul>
          {services.map(service => (
            <li key={service._id}>
              <strong>{service.providerName}</strong> - {service.serviceType}<br/>
              {service.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ServiceList;