import { apiClient } from './api.client';

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface GenerateInvoiceData {
  clientId: string;
  clientName: string;
  clientEmail: string;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  btwPercentage: number;
  btwAmount: number;
  grandTotal: number;
  invoiceDate: string;
  invoiceNumber: string;
  kvkNumber: string;
  btwId: string;
  iban: string;
}

export const invoiceApi = {
  generate: async (data: GenerateInvoiceData): Promise<Blob> => {
    const response = await apiClient.post('/invoices/generate', data, {
      responseType: 'blob',
    });
    return response.data;
  },
};
