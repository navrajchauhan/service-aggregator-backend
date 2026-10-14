import React, { useState, useContext } from 'react';

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
  const [packages, setPackages] = useState([{name : '', description : '', price: ''}]);
  const [loading,setLoading] = useState(false);
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
  const addPackage = () => {
    setPackages([...packages, { name : '', description: '', price: ''}]);
  };
  const updatePackage = (index,field,value) =>{
    const updated = [...packages];
    updated[index][field] = value;
    setPackages(updated);
  };
  const removePackage = (index) => {
    if (packages.length === 1) return;
    setPackages(packages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setSuccess('');

  if (!formData.serviceType.trim()) {
      setError('Service type is required');
      return;
  }
  const validPackages = packages.filter(
      (pkg) => pkg.name.trim() && pkg.price !== '' && !isNaN(Number(pkg.price))
    );

    if (validPackages.length === 0) {
      setError('Please add at least one valid package with name and price');
      return;
    }
  try {
    // FormData is required when sending files
    setLoading(true);
    const data = new FormData();
    data.append('serviceType', formData.serviceType);
    data.append('description', formData.description || '');
    data.append('location', formData.location || '');
    data.append('contactNumber', formData.contactNumber || '');
    data.append('packages',JSON.stringify(validPackages));

    // Only add image if user selected one
    images.forEach((file) => {
  data.append('images', file);
});

   await API.post('/api/services', data, {
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
  finally {
    setLoading(false);
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
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '10px' }}>
            <strong>Packages</strong>
          </label>

          {packages.map((pkg, index) => (
            <div
              key={index}
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '10px',
                background: '#fafafa',
              }}
            >
              <div style={{ marginBottom: '10px' }}>
                <label>Package Name</label>
                <input
                  type="text"
                  placeholder="e.g. Basic, Standard, Premium"
                  value={pkg.name}
                  onChange={(e) => updatePackage(index, 'name', e.target.value)}
                  style={{ width: '100%', padding: '8px' }}
                />
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label>Package Description</label>
                <input
                  type="text"
                  placeholder="What’s included?"
                  value={pkg.description}
                  onChange={(e) => updatePackage(index, 'description', e.target.value)}
                  style={{ width: '100%', padding: '8px' }}
                />
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label>Price (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 5000"
                  value={pkg.price}
                  onChange={(e) => updatePackage(index, 'price', e.target.value)}
                  style={{ width: '100%', padding: '8px' }}
                />
              </div>

              {packages.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePackage(index)}
                  style={{
                    background: '#e94560',
                    color: 'white',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Remove Package
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addPackage}
            style={{
              background: '#4cc9f0',
              color: '#1a1a2e',
              border: 'none',
              padding: '8px 14px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            + Add Package
          </button>
        </div>
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
          disabled = {loading}
          style={{
            padding: '10px 20px',
            background: '#1a1a2e',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          {loading ? 'Adding...': 'Add Service'}
        </button>
      </form>
    </div>
  );
};

export default AddService;