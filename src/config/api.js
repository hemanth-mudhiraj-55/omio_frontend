const isBrowser = typeof window !== 'undefined';
const hostname = isBrowser ? window.location.hostname : '';
const isLocalHost = hostname === 'localhost' || hostname === '127.0.0.1';

export const API_BASE = import.meta.env.VITE_API_URL
  || (isLocalHost ? 'http://localhost:4000' : 'https://omio-backend-6v3f.onrender.com');
