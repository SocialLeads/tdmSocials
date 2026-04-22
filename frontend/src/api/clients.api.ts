import { apiClient } from './api.client';

export interface Client {
  id: string;
  name: string;
  email: string;
  industry: string;
  totalEmailsSent: number;
  emailsSinceLastInvoice: number;
  lastInvoiceDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientData {
  name: string;
  email: string;
  industry: string;
}

export const clientsApi = {
  getAll: async (): Promise<Client[]> => {
    const response = await apiClient.get('/clients');
    return response.data;
  },

  create: async (data: CreateClientData): Promise<Client> => {
    const response = await apiClient.post('/clients', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateClientData>): Promise<Client> => {
    const response = await apiClient.put(`/clients/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/clients/${id}`);
  },

  triggerDailyCron: async (clientIds?: string[]): Promise<{ sent: number; failed: number }> => {
    const response = await apiClient.post('/admin/trigger-daily-cron', clientIds?.length ? { clientIds } : {});
    return response.data;
  },

  checkCredits: async (): Promise<{ balances: { service: string; balance: number; currency: string }[] }> => {
    const response = await apiClient.post('/admin/check-credits');
    return response.data;
  },
};
