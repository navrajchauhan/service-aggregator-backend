import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import ServiceList from './components/ServiceList';
import Login from './components/Login';
import Register from './components/Register';
import AddService from './components/AddService';
import MyServices from './components/MyServices';
import EditService from './components/EditService';
import MyBookings from './components/MyBookings';
import ServiceDetail from './components/ServiceDetail';
import './App.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        Service Aggregator
      </Link>

      <div className="navbar-links">
        {user ? (
          <>
            {user.role === 'provider' && (
              <Link to="/my-services">My Services</Link>
            )}
            <Link to="/my-bookings">My Bookings</Link>
            <span className="nav-text">
              Hello, <strong>{user.name}</strong>
            </span>
            <button onClick={logout} className="logout-btn">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: 'white' }}>Login</Link>
            <Link to="/register" style={{ color: 'white' }}>Register</Link>
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
        <div className="main-container">
          <Routes>
            <Route path="/" element={<ServiceList />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/add-service" element={<AddService />} />
            <Route path="/my-services" element={<MyServices />} />
            <Route path="/edit-service/:id" element={<EditService />} />
            <Route path="/my-bookings" element={<MyBookings />} />
            <Route path="/service/:id" element={<ServiceDetail />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;