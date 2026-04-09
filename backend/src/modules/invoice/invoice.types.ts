export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface InvoiceData {
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
}
