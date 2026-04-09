import React, { useState, useEffect } from 'react';
import { INDUSTRIES } from '../constants/industries';
import { clientsApi, Client } from '../api/clients.api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
  client: Client | null;
}

const EditClientModal: React.FC<Props> = ({ isOpen, onClose, onUpdated, client }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [industry, setIndustry] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (client && isOpen) { setName(client.name); setEmail(client.email); setIndustry(client.industry); setError(''); }
  }, [client, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !client) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await clientsApi.update(client.id, { name, email, industry });
      onUpdated(); onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(typeof msg === 'string' ? msg : msg?.message || 'Klant bijwerken mislukt');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-[color:var(--c-bg)] rounded-xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-semibold text-[color:var(--c-text)] mb-4">Klant bewerken</h2>
        {error && (<div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>)}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[color:var(--c-text2)] mb-1">Bedrijfsnaam</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-3 py-2 border border-[color:var(--c-border)] rounded-lg bg-[color:var(--c-bg)] text-[color:var(--c-text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--c-primary)]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[color:var(--c-text2)] mb-1">E-mail</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3 py-2 border border-[color:var(--c-border)] rounded-lg bg-[color:var(--c-bg)] text-[color:var(--c-text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--c-primary)]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[color:var(--c-text2)] mb-1">Branche</label>
            <select value={industry} onChange={(e) => setIndustry(e.target.value)} className="w-full px-3 py-2 border border-[color:var(--c-border)] rounded-lg bg-[color:var(--c-bg)] text-[color:var(--c-text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--c-primary)]">
              {INDUSTRIES.map((ind) => (<option key={ind} value={ind}>{ind}</option>))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-[color:var(--c-text2)] hover:text-[color:var(--c-text)] transition-colors">Annuleren</button>
            <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium bg-[color:var(--c-primary)] text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity">{loading ? 'Opslaan...' : 'Wijzigingen opslaan'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditClientModal;
