import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import ServiceList from './components/ServiceList';
import Login from './components/Login';
import Register from './components/Register';
import AddService from './components/AddService';
import MyServices from './components/MyServices';
import MyBookings from './components/MyBookings';

import './App.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav
      style={{
        padding: '15px 30px',
        background: '#1a1a2e',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
    <Link to="/my-bookings" style={{ color: '#4cc9f0', textDecoration: 'none' }}>
  My Bookings
</Link>
      <Link
        to="/"
        style={{
          color: 'white',
          textDecoration: 'none',
          fontSize: '1.3rem',
          fontWeight: 'bold',
        }}
      >
        Service Aggregator
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {user ? (
          <>
            {user.role === 'provider' && (
              <>
                <Link to="/my-services" style={{ color: '#4cc9f0', textDecoration: 'none' }}>
                  My Services
                </Link>
                <Link to="/add-service" style={{ color: '#4cc9f0', textDecoration: 'none' }}>
                  + Add Service
                </Link>
              </>
            )}
            <span>
              Hello, <strong>{user.name}</strong> ({user.role})
            </span>
            <button
              onClick={logout}
              style={{
                background: '#e94560',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                cursor: 'pointer',
                borderRadius: '4px',
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: 'white', textDecoration: 'none' }}>
              Login
            </Link>
            <Link to="/register" style={{ color: 'white', textDecoration: 'none' }}>
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
    
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <div style={{ padding: '20px' }}>
          <Routes>
            <Route path="/" element={<ServiceList />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/add-service" element={<AddService />} />
            <Route path="/my-services" element={<MyServices />} />
            <Route path="/my-bookings" element={<MyBookings />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;