import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
// import { initPerformanceMonitoring } from './utils/performance';

// Smart app loading - default to production app
const urlParams = new URLSearchParams(window.location.search);
const step = urlParams.get('step');

let AppComponent;
if (step === '2') {
  AppComponent = React.lazy(() => import('./App.step2'));
} else {
  // Default to production app (step 3)
  AppComponent = React.lazy(() => import('./App.step3'));
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

// Simple error catching with loading boundary
try {
  root.render(
    <React.StrictMode>
      <React.Suspense fallback={
        <div style={{ 
          padding: '40px', 
          textAlign: 'center', 
          fontFamily: 'Arial, sans-serif',
          backgroundColor: '#000000',
          color: '#ffffff',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div>
            <h1>🛒 Loading My Grocery App...</h1>
            <p>Preparing smart sharing system...</p>
          </div>
        </div>
      }>
        <AppComponent />
      </React.Suspense>
    </React.StrictMode>
  );
} catch (error) {
  console.error('Failed to render app:', error);
  root.render(
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🛒 My Grocery App</h1>
      <div style={{ color: 'red', marginTop: '20px' }}>
        <h3>Error loading app:</h3>
        <pre>{error instanceof Error ? error.message : String(error)}</pre>
      </div>
    </div>
  );
}

// Initialize performance monitoring
// initPerformanceMonitoring();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
