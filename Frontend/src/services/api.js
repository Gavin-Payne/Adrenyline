import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`Request to ${config.url} with token`);
    } else {
      console.log(`Request to ${config.url} without token`);
    }
    return config;
  },
  error => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  response => {
    console.log(`Response from ${response.config.url} - Status: ${response.status}`);
    return response;
  },
  error => {
    console.error(`Error from ${error.config?.url || 'unknown endpoint'}: ${error.message}`);
    if (error.response?.status === 401) {
      console.log('Authentication error - clearing token');
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default api;
