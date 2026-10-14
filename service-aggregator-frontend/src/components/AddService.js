import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../api';

const AddService = () => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    serviceType: '',
    description: '',
    price: '',
    location: '',
    contactNumber: '',
  });
  const [images, setImages] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Redirect if not logged in or not a provider
  if (!user) {
    return <p>Please login first.</p>;
  }

  if (user.role !== 'provider') {
    return <p>Only service providers can add services.</p>;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setSuccess('');

  try {
    // FormData is required when sending files
    const data = new FormData();
    data.append('serviceType', formData.serviceType);
    data.append('description', formData.description || '');
    data.append('price', formData.price || '');
    data.append('location', formData.location || '');
    data.append('contactNumber', formData.contactNumber || '');

    // Only add image if user selected one
    images.forEach((file) => {
  data.append('images', file);
});

   const res = await API.post('/api/services', data, {
      headers: {
        Authorization: `Bearer ${token}`,
        // 'Content-Type': 'multipart/form-data',
      },
    });

    setSuccess('Service added successfully!');
    setTimeout(() => navigate('/my-services'), 1200);
  } catch (err) {
    console.error(err.response?.data || err.message);
    setError(err.response?.data?.error || 'Failed to add service');
  }
};

  return (
    <div style={{ maxWidth: '500px', margin: '40px auto' }}>
      <h2>Add New Service</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Service Type (e.g. Caterer, Florist, Photographer)</label>
          <input
            type="text"
            name="serviceType"
            value={formData.serviceType}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Price (₹)</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Contact Number</label>
          <input
            type="text"
            name="contactNumber"
            value={formData.contactNumber}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Service Images (max 5)</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {const files = Array.from(e.target.files||[]);
            setImages(files);
            }}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <button
          type="submit"
          style={{
            padding: '10px 20px',
            background: '#1a1a2e',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Add Service
        </button>
      </form>
    </div>
  );
};

export default AddService;