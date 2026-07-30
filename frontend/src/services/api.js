import axios from 'axios';

// Use localhost during development and relative URL in production
const API_BASE_URL =
  import.meta.env.DEV
    ? 'http://localhost:5000/api'
    : '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const extractBusinessCard = async (payload, isFile = false) => {
  if (isFile) {
    const formData = new FormData();
    formData.append('image', payload);

    return api.post('/extract', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  return api.post('/extract', {
    image_url: payload,
  });
};

export const submitBusinessCard = async (cardData) => {
  return api.post('/submit', cardData);
};

export default api;