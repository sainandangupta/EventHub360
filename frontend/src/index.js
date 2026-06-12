import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Provider } from 'react-redux';
import store from './redux/store';
import axios from 'axios';

// Intercept all Axios requests to rewrite local backend URLs in production
axios.interceptors.request.use(
  (config) => {
    const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    if (config.url && config.url.startsWith('http://localhost:5000')) {
      config.url = config.url.replace('http://localhost:5000', apiBaseUrl);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
