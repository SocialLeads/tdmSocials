import React, { useState } from 'react';
import { Client } from '../api/clients.api';
import { invoiceApi, InvoiceLineItem, GenerateInvoiceData } from '../api/invoice.api';

interface Props { isOpen: boolean; onClose: () => void; client: Client | null; onGenerated: () => void; }

const emptyLineItem = (): InvoiceLineItem => ({ description: '', quantity: 0, unitPrice: 0, total: 0 });

const InvoiceGeneratorModal: React.FC<Props> = ({ isOpen, onClose, client, onGenerated }) => {
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([]);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [btwPercentage, setBtwPercentage] = useState(21);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (client && isOpen) {
      setLineItems([
        { description: 'Social Media Content E-mails', quantity: client.emailsSinceLastInvoice, unitPrice: 0, total: 0 },
        { description: 'Leadgeneratie', quantity: 0, unitPrice: 0, total: 0 },
      ]);
      setInvoiceNumber(`FAC-${Date.now().toString().slice(-6)}`);
      setError('');
    }
  }, [client, isOpen]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !client) return null;

  const updateLineItem = (index: number, field: keyof InvoiceLineItem, value: string | number) => {
    const updated = [...lineItems];
    (updated[index] as any)[field] = value;
    if (field === 'quantity' || field === 'unitPrice') { updated[index].total = Number(updated[index].quantity) * Number(updated[index].unitPrice); }
    setLineItems(updated);
  };

  const addLineItem = () => { setLineItems([...lineItems, { ...emptyLineItem(), description: 'Leadgeneratie' }]); };
  const removeLineItem = (index: number) => { if (lineItems.length <= 1) return; setLineItems(lineItems.filter((_, i) => i !== index)); };
  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
  const btwAmount = subtotal * (btwPercentage / 100);
  const grandTotal = subtotal + btwAmount;

  const handleGenerate = async () => {
    setError(''); setLoading(true);
    try {
      const data: GenerateInvoiceData = { clientId: client.id, clientName: client.name, clientEmail: client.email, lineItems, subtotal, btwPercentage, btwAmount, grandTotal, invoiceDate: new Date().toISOString().split('T')[0], invoiceNumber };
      const blob = await invoiceApi.generate(data);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `${invoiceNumber}.pdf`; document.body.appendChild(a); a.click(); document.body.removeChild(a); window.URL.revokeObjectURL(url);
      onGenerated(); onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(typeof msg === 'string' ? msg : msg?.message || 'Factuur genereren mislukt');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-[color:var(--c-bg)] rounded-xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-semibold text-[color:var(--c-text)] mb-4">Factuur genereren</h2>
        {error && (<div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>)}

        <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-[color:var(--c-bg2,#f9fafb)] rounded-lg">
          <div><p className="text-xs font-medium text-[color:var(--c-text2)] uppercase">Klant</p><p className="text-sm font-semibold text-[color:var(--c-text)]">{client.name}</p></div>
          <div><p className="text-xs font-medium text-[color:var(--c-text2)] uppercase">E-mail</p><p className="text-sm text-[color:var(--c-text)]">{client.email}</p></div>
          <div><p className="text-xs font-medium text-[color:var(--c-text2)] uppercase">Factuurnr.</p><input type="text" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} className="text-sm px-2 py-1 border border-[color:var(--c-border)] rounded bg-[color:var(--c-bg)] text-[color:var(--c-text)]" /></div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-[color:var(--c-text)]">Regelitems</h3>
            <button onClick={addLineItem} className="text-xs px-3 py-1 bg-[color:var(--c-primary)] text-white rounded-lg hover:opacity-90">+ Item toevoegen</button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-medium text-[color:var(--c-text2)] uppercase">
                <th className="pb-2">Omschrijving</th><th className="pb-2 w-20">Aantal</th><th className="pb-2 w-24">Stuksprijs</th><th className="pb-2 w-24">Totaal</th><th className="pb-2 w-8"></th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item, i) => (
                <tr key={i} className="border-t border-[color:var(--c-border)]">
                  <td className="py-2 pr-2"><input type="text" value={item.description} onChange={(e) => updateLineItem(i, 'description', e.target.value)} className="w-full px-2 py-1 border border-[color:var(--c-border)] rounded bg-[color:var(--c-bg)] text-[color:var(--c-text)]" /></td>
                  <td className="py-2 pr-2"><input type="number" value={item.quantity} onChange={(e) => updateLineItem(i, 'quantity', Number(e.target.value))} className="w-full px-2 py-1 border border-[color:var(--c-border)] rounded bg-[color:var(--c-bg)] text-[color:var(--c-text)]" /></td>
                  <td className="py-2 pr-2"><input type="number" step="0.01" value={item.unitPrice} onChange={(e) => updateLineItem(i, 'unitPrice', Number(e.target.value))} className="w-full px-2 py-1 border border-[color:var(--c-border)] rounded bg-[color:var(--c-bg)] text-[color:var(--c-text)]" /></td>
                  <td className="py-2 pr-2 font-semibold text-[color:var(--c-text)]">€{item.total.toFixed(2)}</td>
                  <td className="py-2">{lineItems.length > 1 && (<button onClick={() => removeLineItem(i)} className="text-red-500 hover:text-red-700 text-xs">X</button>)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end mb-6">
          <div className="w-64 space-y-2 text-sm">
            <div className="flex justify-between text-[color:var(--c-text2)]">
              <span>Subtotaal</span>
              <span>€{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-[color:var(--c-text2)]">
              <div className="flex items-center gap-1">
                <span>BTW</span>
                <input type="number" value={btwPercentage} onChange={(e) => setBtwPercentage(Number(e.target.value))} className="w-14 px-1 py-0.5 text-center border border-[color:var(--c-border)] rounded bg-[color:var(--c-bg)] text-[color:var(--c-text)] text-xs" />
                <span>%</span>
              </div>
              <span>€{btwAmount.toFixed(2)}</span>
            </div>
            <div className="bg-[color:var(--c-primary)] text-white px-4 py-3 rounded-lg flex justify-between items-center">
              <span className="text-xs opacity-80">Totaal incl. BTW</span>
              <span className="text-xl font-bold">€{grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-[color:var(--c-text2)] hover:text-[color:var(--c-text)]">Annuleren</button>
          <button onClick={handleGenerate} disabled={loading || lineItems.length === 0} className="px-4 py-2 text-sm font-medium bg-[color:var(--c-primary)] text-white rounded-lg hover:opacity-90 disabled:opacity-50">{loading ? 'Genereren...' : 'PDF genereren'}</button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceGeneratorModal;
