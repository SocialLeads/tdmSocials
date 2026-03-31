import { apiClient } from './api.client';

// Auth API endpoints
export const authApi = {
  refreshToken: async () => {
    const response = await apiClient.post('/auth/refresh');
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  login: async (identifier: string, password: string) => {
    const response = await apiClient.post('/auth/login', { identifier, password });
    return response.data;
  },

  register: async (email: string, password: string, username?: string) => {
    const response = await apiClient.post('/auth/register', { email, password, username });
    return response.data;
  },

  requestPasswordReset: async (email: string) => {
    const response = await apiClient.post('/auth/password-reset/request', { email });
    return response.data;
  },

  validateResetToken: async (token: string) => {
    const response = await apiClient.post('/auth/password-reset/validate', { token });
    return response.data;
  },

  resetPassword: async (token: string, newPassword: string) => {
    const response = await apiClient.post('/auth/password-reset/confirm', { 
      token, 
      newPassword 
    });
    return response.data;
  },
};

export default authApi;
