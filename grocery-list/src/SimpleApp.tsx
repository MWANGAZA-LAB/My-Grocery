import React, { useState, useEffect } from 'react';
import './App.css';

const SimpleApp: React.FC = () => {
  const [status, setStatus] = useState('Loading...');

  useEffect(() => {
    // Test basic functionality
    setTimeout(() => {
      setStatus('App loaded successfully!');
    }, 1000);
  }, []);

  return (
    <div style={{ 
      padding: '40px', 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '800px',
      margin: '0 auto',
      backgroundColor: '#121212',
      color: '#ffffff',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#90caf9' }}>🛒 My Grocery App</h1>
      <p>{status}</p>
      
      <div style={{ marginTop: '30px' }}>
        <h2>Smart Sharing System</h2>
        <p>✅ One-tap sharing</p>
        <p>✅ Guest access</p>
        <p>✅ Permission presets</p>
        <p>✅ QR code sharing</p>
        <p>✅ Multi-channel sharing</p>
      </div>

      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#1e1e1e', borderRadius: '8px' }}>
        <h3>Next Steps:</h3>
        <p>1. Set up your Firebase project</p>
        <p>2. Update environment variables</p>
        <p>3. Test the smart sharing features</p>
      </div>
    </div>
  );
};

export default SimpleApp;
