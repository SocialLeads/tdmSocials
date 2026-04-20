import React, { useState } from 'react';
import { Client } from '../api/clients.api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (clientIds?: string[]) => void;
  clients: Client[];
  loading?: boolean;
}

const SendEmailsModal: React.FC<Props> = ({ isOpen, onClose, onConfirm, clients, loading = false }) => {
  const [mode, setMode] = useState<'all' | 'select'>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      setMode('all');
      setSelectedIds(new Set());
      setSearch('');
    }
  }, [isOpen]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleClient = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleAll = () => {
    if (selectedIds.size === clients.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(clients.map((c) => c.id)));
    }
  };

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.industry.toLowerCase().includes(search.toLowerCase()),
  );

  const handleConfirm = () => {
    if (mode === 'all') {
      onConfirm();
    } else {
      onConfirm(Array.from(selectedIds));
    }
  };

  const canSend = mode === 'all' || selectedIds.size > 0;
  const sendCount = mode === 'all' ? clients.length : selectedIds.size;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-[color:var(--c-bg)] rounded-xl shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>

        <div className="p-6 pb-4">
          <div className="flex items-start gap-3 mb-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[color:var(--c-text)]">E-mails handmatig versturen</h2>
              <p className="mt-1 text-sm text-[color:var(--c-text2)]">Dit verstuurt direct content e-mails met AI-gegenereerde afbeeldingen. Gebruik dit alleen voor testen of als de dagelijkse cron is mislukt.</p>
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setMode('all')}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                mode === 'all'
                  ? 'bg-[color:var(--c-primary)] text-white border-[color:var(--c-primary)]'
                  : 'border-[color:var(--c-border)] text-[color:var(--c-text2)] hover:bg-[color:var(--c-bg2,#f3f4f6)]'
              }`}
            >
              Alle klanten ({clients.length})
            </button>
            <button
              onClick={() => setMode('select')}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                mode === 'select'
                  ? 'bg-[color:var(--c-primary)] text-white border-[color:var(--c-primary)]'
                  : 'border-[color:var(--c-border)] text-[color:var(--c-text2)] hover:bg-[color:var(--c-bg2,#f3f4f6)]'
              }`}
            >
              Selecteer klanten
            </button>
          </div>
        </div>

        {mode === 'select' && (
          <div className="px-6 flex-1 overflow-hidden flex flex-col min-h-0">
            <div className="mb-3 flex items-center gap-2">
              <input
                type="text"
                placeholder="Zoeken..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 px-3 py-1.5 text-sm border border-[color:var(--c-border)] rounded-lg bg-[color:var(--c-bg)] text-[color:var(--c-text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--c-primary)]"
              />
              <button
                onClick={toggleAll}
                className="text-xs px-3 py-1.5 text-[color:var(--c-primary)] hover:underline whitespace-nowrap"
              >
                {selectedIds.size === clients.length ? 'Deselecteer alles' : 'Selecteer alles'}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto border border-[color:var(--c-border)] rounded-lg mb-4">
              {filteredClients.map((client) => (
                <label
                  key={client.id}
                  className="flex items-center gap-3 px-3 py-2.5 hover:bg-[color:var(--c-bg2,#f9fafb)] cursor-pointer border-b border-[color:var(--c-border)] last:border-b-0"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.has(client.id)}
                    onChange={() => toggleClient(client.id)}
                    className="w-4 h-4 rounded border-[color:var(--c-border)] accent-[color:var(--c-primary)]"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[color:var(--c-text)] truncate">{client.name}</p>
                    <p className="text-xs text-[color:var(--c-text2)] truncate">{client.email}</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 bg-[color:var(--c-primary)] text-white rounded-full opacity-70">
                    {client.industry}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="p-6 pt-2 flex justify-between items-center border-t border-[color:var(--c-border)]">
          <p className="text-xs text-[color:var(--c-text2)]">
            {sendCount} klant{sendCount !== 1 ? 'en' : ''} geselecteerd
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-[color:var(--c-text2)] hover:text-[color:var(--c-text)] transition-colors"
            >
              Annuleren
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading || !canSend}
              className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-opacity"
            >
              {loading ? 'Bezig...' : `Versturen (${sendCount})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendEmailsModal;
