import axios from 'axios';

// In development, Vite proxy handles /api requests to localhost:3000
// In production, use the VITE_API_URL environment variable
const API_URL = import.meta.env.VITE_API_URL || '';

export const api = axios.create({
  baseURL: API_URL,
});
