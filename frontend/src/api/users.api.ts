import { apiClient } from './api.client';

export const usersApi = {
  getCurrentUser: async () => {
    const response = await apiClient.get('/users/currentUser');
    return response.data;
  },

  getAllUsers: async () => {
    const response = await apiClient.get('/users');
    return response.data;
  },
};

export default usersApi;
