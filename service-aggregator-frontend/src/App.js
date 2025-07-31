import React from 'react';
import './App.css';
import ServiceList from './components/ServiceList';

function App() {
  return (
    <div className="App">
      <h1>Service Aggregator</h1>
      <ServiceList />
    </div>
  );
}

export default App;