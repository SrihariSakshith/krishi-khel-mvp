import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// This is now handled in AuthContext, but keeping it here as a fallback
// for non-context usages can be useful.
const token = localStorage.getItem('token');
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export default api;