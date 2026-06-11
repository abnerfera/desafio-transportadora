import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5264/api',
});

export default api;