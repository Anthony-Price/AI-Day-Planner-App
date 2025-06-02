// Import necessary dependencies from React and other modules
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import * as serviceWorker from './serviceWorker';

// Create a root element for the React application
// This is where our entire React app will be mounted in the HTML
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// Render our main App component inside React's StrictMode
// StrictMode is a development tool that helps identify potential problems
// It renders components twice to help detect side effects
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker for PWA functionality
serviceWorker.register();

// Optional: Performance monitoring setup
// This can be used to measure and report various performance metrics
// You can pass a function to log results or send to analytics
reportWebVitals();
