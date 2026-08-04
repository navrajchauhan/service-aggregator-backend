import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const EditService = () => {
  const { id } = useParams();
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    serviceType: '',
    description: '',
    price: '',
    location: '',
    contactNumber: '',
  });

  const [blockedDates, setBlockedDates] = useState([]);
  const [newDate, setNewDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dateMessage, setDateMessage] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'provider') return;

    const fetchService = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/services/my-services', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const service = res.data.find((s) => s._id === id);
        if (!service) {
          setError('Service not found');
          setLoading(false);
          return;
        }

        setFormData({
          serviceType: service.serviceType || '',
          description: service.description || '',
          price: service.price || '',
          location: service.location || '',
          contactNumber: service.contactNumber || '',
        });

        // Only keep dates that are blocked
        const blocked = (service.availability || []).filter((a) => a.isAvailable === false);
        setBlockedDates(blocked);
        setLoading(false);
      } catch (err) {
        setError('Failed to load service');
        setLoading(false);
      }
    };

    fetchService();
  }, [id, user, token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await axios.put(`http://localhost:5000/api/services/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Service updated successfully!');
      setTimeout(() => navigate('/my-services'), 1200);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update service');
    }
  };

  const handleBlockDate = async () => {
    if (!newDate) {
      setDateMessage('Please select a date');
      return;
    }

    try {
      const res = await axios.post(
        `http://localhost:5000/api/services/${id}/block-date`,
        { date: newDate },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const blocked = (res.data.availability || []).filter((a) => a.isAvailable === false);
      setBlockedDates(blocked);
      setNewDate('');
      setDateMessage('Date blocked successfully');
    } catch (err) {
      setDateMessage(err.response?.data?.error || 'Failed to block date');
    }
  };

  const handleUnblockDate = async (dateId) => {
    try {
      const res = await axios.delete(
        `http://localhost:5000/api/services/${id}/block-date/${dateId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const blocked = (res.data.availability || []).filter((a) => a.isAvailable === false);
      setBlockedDates(blocked);
      setDateMessage('Date unblocked');
    } catch (err) {
      setDateMessage(err.response?.data?.error || 'Failed to unblock date');
    }
  };

  if (!user) return <p>Please login first.</p>;
  if (user.role !== 'provider') return <p>Only providers can edit services.</p>;
  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto' }}>
      <h2>Edit Service</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

      <form onSubmit={handleSubmit} style={{ marginBottom: '40px' }}>
        <div style={{ marginBottom: '15px' }}>
          <label>Service Type</label>
          <input type="text" name="serviceType" value={formData.serviceType} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Description</label>
          <textarea name="description" value={formData.description} onChange={handleChange} rows="3" style={{ width: '100%', padding: '8px' }} />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Price (₹)</label>
          <input type="number" name="price" value={formData.price} onChange={handleChange} style={{ width: '100%', padding: '8px' }} />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Location</label>
          <input type="text" name="location" value={formData.location} onChange={handleChange} style={{ width: '100%', padding: '8px' }} />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Contact Number</label>
          <input type="text" name="contactNumber" value={formData.contactNumber} onChange={handleChange} style={{ width: '100%', padding: '8px' }} />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" style={{ padding: '10px 20px', background: '#1a1a2e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Save Changes
          </button>
          <button type="button" onClick={() => navigate('/my-services')} style={{ padding: '10px 20px', background: '#ccc', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Cancel
          </button>
        </div>
      </form>

      {/* Blocked Dates Section */}
      <div style={{ borderTop: '2px solid #eee', paddingTop: '30px' }}>
        <h3>Blocked / Booked Dates</h3>
        <p style={{ color: '#666', marginBottom: '15px' }}>
          By default you are available on all dates. Block a date only if you are already booked (online or offline).
        </p>

        {dateMessage && (
          <p style={{ color: dateMessage.includes('success') || dateMessage.includes('unblocked') ? 'green' : 'red' }}>
            {dateMessage}
          </p>
        )}

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} style={{ padding: '8px' }} />
          <button onClick={handleBlockDate} style={{ background: '#e94560', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>
            Block Date
          </button>
        </div>

        {blockedDates.length === 0 ? (
          <p>No dates blocked. You are available on all dates.</p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {blockedDates.map((item) => (
              <div key={item._id} style={{ background: '#ffebee', border: '1px solid #ef9a9a', borderRadius: '6px', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>{new Date(item.date).toLocaleDateString()}</span>
                <button onClick={() => handleUnblockDate(item._id)} style={{ background: '#1a1a2e', color: 'white', border: 'none', borderRadius: '4px', padding: '2px 8px', cursor: 'pointer', fontSize: '12px' }}>
                  Unblock
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EditService;