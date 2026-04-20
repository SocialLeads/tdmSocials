import axios from 'axios';

// Base API configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important: This allows cookies to be sent with requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

// Handle auth errors and token refresh
let isRefreshing = false;

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Never retry auth endpoints
    if (originalRequest.url?.startsWith('/auth/')) {
      return Promise.reject(error);
    }

    // If error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry && !isRefreshing) {
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await apiClient.post('/auth/refresh');
        const newAccessToken = response.data.accessToken;

        localStorage.setItem('authToken', newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return apiClient(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/admin/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
