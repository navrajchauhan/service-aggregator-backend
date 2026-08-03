import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const MyServices = () => {
  const { user, token } = useContext(AuthContext);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'provider') return;

    const fetchMyServices = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/services/my-services', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setServices(res.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load your services');
        setLoading(false);
      }
    };

    fetchMyServices();
  }, [user, token]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;

    try {
      await axios.delete(`http://localhost:5000/api/services/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setServices(services.filter((service) => service._id !== id));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete service');
    }
  };

  if (!user) return <p>Please login first.</p>;
  if (user.role !== 'provider') return <p>Only providers can view this page.</p>;
  if (loading) return <p>Loading your services...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>My Services</h2>
        <Link
          to="/add-service"
          style={{
            background: '#1a1a2e',
            color: 'white',
            padding: '10px 18px',
            textDecoration: 'none',
            borderRadius: '5px',
          }}
        >
          + Add New Service
        </Link>
      </div>

      {services.length === 0 ? (
        <p>You haven't added any services yet.</p>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {services.map((service) => (
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
                {service.serviceType}
              </h3>

              {service.description && (
                <p style={{ margin: '0 0 10px 0', color: '#555' }}>
                  {service.description}
                </p>
              )}

              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '15px' }}>
                {service.price && <span><strong>Price:</strong> ₹{service.price}</span>}
                {service.location && <span><strong>Location:</strong> {service.location}</span>}
                {service.contactNumber && <span><strong>Contact:</strong> {service.contactNumber}</span>}
              </div>

              <button
                onClick={() => handleDelete(service._id)}
                style={{
                  background: '#e94560',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyServices;