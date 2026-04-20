import { Injectable } from '@nestjs/common';
import { InvoiceData } from './invoice.types';

@Injectable()
export class InvoiceTemplateService {
  generateHtml(data: InvoiceData): string {
    // Calculate vervaldatum (14 days after invoice date)
    const invoiceDate = new Date(data.invoiceDate);
    const vervalDate = new Date(invoiceDate);
    vervalDate.setDate(vervalDate.getDate() + 14);
    const formatDate = (d: Date) => d.toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
    const invoiceDateStr = formatDate(invoiceDate);
    const vervalDateStr = formatDate(vervalDate);

    const lineItemsHtml = data.lineItems
      .map(
        (item) => `
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;font-size:14px;color:#374151;text-align:center;">${item.quantity}x</td>
        <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;font-size:14px;color:#374151;white-space:pre-line;">${item.description}</td>
        <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;font-size:14px;color:#374151;text-align:right;">&euro; ${item.unitPrice.toFixed(2).replace('.', ',')}</td>
        <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;font-size:14px;color:#374151;text-align:right;font-weight:600;">&euro; ${item.total.toFixed(2).replace('.', ',')}</td>
        <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;font-size:14px;color:#374151;text-align:right;">${data.btwPercentage}%</td>
      </tr>`,
      )
      .join('');

    return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Factuur ${data.invoiceNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #111827; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style>
</head>
<body>
  <div style="max-width:800px;margin:0 auto;padding:48px 40px;">

    <div style="text-align:right;margin-bottom:40px;line-height:1.6;">
      <p style="font-size:18px;font-weight:700;color:#111827;">TDM AUTO &amp; SOCIAL SOLUTIONS</p>
      <p style="font-size:13px;color:#6b7280;">
        Heuvelstraat 27B<br/>
        4812 PG Breda
      </p>
      <p style="font-size:13px;color:#6b7280;margin-top:8px;">
        Info@tdmsocials.com<br/>
        0629212304
      </p>
      <p style="font-size:13px;color:#6b7280;margin-top:8px;">
        KVK: 98790595<br/>
        Btw: NL005353984B34<br/>
        Bank: NL08 ABNA 0150 2705 85
      </p>
    </div>

    <div style="margin-bottom:40px;padding:20px;background:#f9fafb;border-radius:8px;">
      <p style="font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">Factuur aan</p>
      <p style="font-size:16px;font-weight:600;color:#111827;margin-bottom:4px;">${data.clientName}</p>
      <p style="font-size:14px;color:#6b7280;">${data.clientEmail}</p>
    </div>

    <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:32px;">
      <h2 style="font-size:24px;font-weight:700;color:#111827;">Factuur ${data.invoiceNumber}</h2>
      <table style="font-size:13px;color:#374151;border-collapse:collapse;">
        <tr><td style="padding:4px 16px 4px 0;color:#6b7280;">Factuurdatum:</td><td style="padding:4px 0;font-weight:600;">${invoiceDateStr}</td></tr>
        <tr><td style="padding:4px 16px 4px 0;color:#6b7280;">Vervaldatum:</td><td style="padding:4px 0;font-weight:600;">${vervalDateStr}</td></tr>
      </table>
    </div>

    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
      <thead>
        <tr style="border-bottom:2px solid #111827;">
          <th style="padding:12px 16px;text-align:center;font-size:12px;font-weight:600;color:#111827;text-transform:uppercase;width:60px;"></th>
          <th style="padding:12px 16px;text-align:left;font-size:12px;font-weight:600;color:#111827;text-transform:uppercase;">Omschrijving</th>
          <th style="padding:12px 16px;text-align:right;font-size:12px;font-weight:600;color:#111827;text-transform:uppercase;">Bedrag</th>
          <th style="padding:12px 16px;text-align:right;font-size:12px;font-weight:600;color:#111827;text-transform:uppercase;">Totaal</th>
          <th style="padding:12px 16px;text-align:right;font-size:12px;font-weight:600;color:#111827;text-transform:uppercase;">Btw</th>
        </tr>
      </thead>
      <tbody>
        ${lineItemsHtml}
      </tbody>
    </table>

    <div style="display:flex;justify-content:flex-end;margin-bottom:48px;">
      <table style="border-collapse:collapse;font-size:14px;min-width:280px;">
        <tr>
          <td style="padding:8px 24px 8px 0;color:#6b7280;text-align:right;font-weight:600;">Subtotaal</td>
          <td style="padding:8px 0;text-align:right;color:#374151;">&euro; ${data.subtotal.toFixed(2).replace('.', ',')}</td>
        </tr>
        <tr style="border-bottom:1px solid #e5e7eb;">
          <td style="padding:8px 24px 8px 0;color:#6b7280;text-align:right;font-weight:600;">${data.btwPercentage}% btw</td>
          <td style="padding:8px 0;text-align:right;color:#374151;">&euro; ${data.btwAmount.toFixed(2).replace('.', ',')}</td>
        </tr>
        <tr>
          <td style="padding:12px 24px 12px 0;text-align:right;font-weight:700;font-size:16px;color:#111827;">Totaal</td>
          <td style="padding:12px 0;text-align:right;font-weight:700;font-size:16px;color:#111827;">&euro; ${data.grandTotal.toFixed(2).replace('.', ',')}</td>
        </tr>
      </table>
    </div>

    <div style="border-top:1px solid #e5e7eb;padding-top:24px;">
      <p style="font-size:13px;color:#374151;line-height:1.6;">
        We verzoeken u vriendelijk het bovenstaande bedrag van &euro; ${data.grandTotal.toFixed(2).replace('.', ',')} voor ${vervalDateStr} te voldoen op onze bankrekening onder vermelding van de omschrijving ${data.invoiceNumber}. Voor vragen kunt u contact opnemen per e-mail.
      </p>
    </div>
  </div>
</body>
</html>`;
  }
}
