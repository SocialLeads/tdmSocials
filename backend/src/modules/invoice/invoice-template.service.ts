import { Injectable } from '@nestjs/common';
import { InvoiceData } from './invoice.types';

@Injectable()
export class InvoiceTemplateService {
  generateHtml(data: InvoiceData): string {
    const lineItemsHtml = data.lineItems
      .map(
        (item) => `
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;font-size:14px;color:#374151;">${item.description}</td>
        <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;font-size:14px;color:#374151;text-align:center;">${item.quantity}</td>
        <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;font-size:14px;color:#374151;text-align:right;">€${item.unitPrice.toFixed(2)}</td>
        <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;font-size:14px;color:#374151;text-align:right;font-weight:600;">€${item.total.toFixed(2)}</td>
      </tr>`,
      )
      .join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${data.invoiceNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #111827; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style>
</head>
<body>
  <div style="max-width:800px;margin:0 auto;padding:48px 40px;">
    <!-- Header -->
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:48px;">
      <div>
        <h1 style="font-size:32px;font-weight:700;color:#4f46e5;margin-bottom:4px;">TDM Socials</h1>
        <p style="font-size:14px;color:#6b7280;">${data.invoiceNumber}</p>
      </div>
      <div style="text-align:right;">
        <p style="font-size:14px;color:#6b7280;">Date</p>
        <p style="font-size:16px;font-weight:600;color:#111827;">${data.invoiceDate}</p>
      </div>
    </div>

    <!-- Bill To -->
    <div style="margin-bottom:40px;padding:20px;background:#f9fafb;border-radius:8px;">
      <p style="font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">Bill To</p>
      <p style="font-size:16px;font-weight:600;color:#111827;margin-bottom:4px;">${data.clientName}</p>
      <p style="font-size:14px;color:#6b7280;">${data.clientEmail}</p>
    </div>

    <!-- Line Items -->
    <table style="width:100%;border-collapse:collapse;margin-bottom:32px;">
      <thead>
        <tr style="background:#f3f4f6;">
          <th style="padding:12px 16px;text-align:left;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Description</th>
          <th style="padding:12px 16px;text-align:center;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Qty</th>
          <th style="padding:12px 16px;text-align:right;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Unit Price</th>
          <th style="padding:12px 16px;text-align:right;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${lineItemsHtml}
      </tbody>
    </table>

    <!-- Grand Total -->
    <div style="display:flex;justify-content:flex-end;margin-bottom:48px;">
      <div style="background:#4f46e5;color:#ffffff;padding:16px 32px;border-radius:8px;text-align:right;">
        <p style="font-size:12px;opacity:0.8;margin-bottom:4px;">TOTAL DUE</p>
        <p style="font-size:28px;font-weight:700;">€${data.grandTotal.toFixed(2)}</p>
      </div>
    </div>

    <!-- Footer -->
    <div style="border-top:1px solid #e5e7eb;padding-top:24px;">
      <p style="font-size:12px;color:#9ca3af;text-align:center;">
        Thank you for your business. Payment is due within 30 days.<br/>
        TDM Socials | info@tdmsocials.nl | tdmsocials.nl
      </p>
    </div>
  </div>
</body>
</html>`;
  }
}
