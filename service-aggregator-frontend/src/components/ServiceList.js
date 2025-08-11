import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ServiceList = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState(""); // service type filter
  const [filterDate, setFilterDate] = useState(""); // date filter

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

  const filteredServices = services.filter(service => {
    // Filter by service type (case-insensitive)
    const typeMatch = filterType
      ? service.serviceType.toLowerCase().includes(filterType.toLowerCase())
      : true;

    // Filter by date availability
    const dateMatch = filterDate
      ? service.availability?.some(a => a.date === filterDate && a.isAvailable)
      : true;

    return typeMatch && dateMatch;
  });

  if (loading) return <p>Loading services...</p>;

  return (
    <div>
      <h2>All Services</h2>

      {/* Filter controls */}
      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Filter by service type..."
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          style={{ marginRight: "1rem" }}
        />
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />
      </div>

      {filteredServices.length === 0 ? (
        <p>No services found.</p>
      ) : (
        <ul>
          {filteredServices.map(service => (
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
