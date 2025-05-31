import React from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './components/App';
import './index.css';

console.log('Environment:', process.env.NODE_ENV);
// Remove this console log that exposes the client ID
// console.log('Google Client ID:', process.env.REACT_APP_GOOGLE_CLIENT_ID);

const container = document.getElementById('root');
if (!container) {
  console.error('Root element not found!');
} else {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
        <App />
      </GoogleOAuthProvider>
    </React.StrictMode>
  );
}