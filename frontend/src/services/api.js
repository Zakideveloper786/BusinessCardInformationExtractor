import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const extractBusinessCard = async (payload, isFile = false) => {
  if (isFile) {
    // For files, we use multipart/form-data
    const formData = new FormData();
    formData.append('image', payload);
    return api.post('/extract', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  } else {
    // For URL, we send JSON
    return api.post('/extract', { image_url: payload });
  }
};

export const submitBusinessCard = async (cardData) => {
  return api.post('/submit', cardData);
};

export default api;
