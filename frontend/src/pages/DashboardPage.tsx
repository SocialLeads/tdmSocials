import React, { useState, useEffect, useCallback } from 'react';
import { clientsApi, Client } from '../api/clients.api';
import AddClientModal from '../components/AddClientModal';
import EditClientModal from '../components/EditClientModal';
import InvoiceGeneratorModal from '../components/InvoiceGeneratorModal';
import SendEmailsModal from '../components/SendEmailsModal';

const DashboardPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [invoiceClient, setInvoiceClient] = useState<Client | null>(null);
  const [triggeringCron, setTriggeringCron] = useState(false);
  const [cronResult, setCronResult] = useState<string | null>(null);
  const [showSendModal, setShowSendModal] = useState(false);

  const fetchClients = useCallback(async () => {
    try {
      const data = await clientsApi.getAll();
      setClients(data);
    } catch (error) {
      console.error('Klanten ophalen mislukt:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Weet je zeker dat je deze klant wilt verwijderen?')) return;
    try {
      await clientsApi.delete(id);
      fetchClients();
    } catch (error) {
      console.error('Klant verwijderen mislukt:', error);
    }
  };

  const handleTriggerCron = async (clientIds?: string[]) => {
    setShowSendModal(false);
    setTriggeringCron(true);
    setCronResult(null);
    try {
      const result = await clientsApi.triggerDailyCron(clientIds);
      setCronResult(`Verzonden: ${result.sent}, Mislukt: ${result.failed}`);
      fetchClients();
    } catch (error: any) {
      setCronResult(error?.response?.data?.message || 'Dagelijkse e-mails versturen mislukt');
    } finally {
      setTriggeringCron(false);
    }
  };

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.industry.toLowerCase().includes(search.toLowerCase()),
  );

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('nl-NL');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[color:var(--c-text)]">Klanten</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setShowSendModal(true)}
            disabled={triggeringCron}
            className="px-4 py-2 text-sm font-medium border border-[color:var(--c-border)] text-[color:var(--c-text)] rounded-lg hover:bg-[color:var(--c-bg2,#f3f4f6)] disabled:opacity-50"
          >
            {triggeringCron ? 'Verzenden...' : 'Dagelijkse e-mails versturen'}
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 text-sm font-medium bg-[color:var(--c-primary)] text-white rounded-lg hover:opacity-90"
          >
            + Klant toevoegen
          </button>
        </div>
      </div>

      {cronResult && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
          {cronResult}
        </div>
      )}

      <div className="mb-4">
        <input
          type="text"
          placeholder="Zoeken op naam, e-mail of branche..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-[color:var(--c-border)] rounded-lg bg-[color:var(--c-bg)] text-[color:var(--c-text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--c-primary)]"
        />
      </div>

      {loading ? (
        <p className="text-[color:var(--c-text2)]">Laden...</p>
      ) : filteredClients.length === 0 ? (
        <div className="text-center py-12 text-[color:var(--c-text2)]">
          <p className="text-lg mb-2">Nog geen klanten</p>
          <p className="text-sm">Voeg je eerste klant toe om te beginnen.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[color:var(--c-border)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[color:var(--c-bg2,#f9fafb)]">
                <th className="text-left px-4 py-3 font-medium text-[color:var(--c-text2)]">Naam</th>
                <th className="text-left px-4 py-3 font-medium text-[color:var(--c-text2)]">E-mail</th>
                <th className="text-left px-4 py-3 font-medium text-[color:var(--c-text2)]">Branche</th>
                <th className="text-center px-4 py-3 font-medium text-[color:var(--c-text2)]">Totaal e-mails</th>
                <th className="text-center px-4 py-3 font-medium text-[color:var(--c-text2)]">Sinds factuur</th>
                <th className="text-left px-4 py-3 font-medium text-[color:var(--c-text2)]">Laatste factuur</th>
                <th className="text-right px-4 py-3 font-medium text-[color:var(--c-text2)]">Acties</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client) => (
                <tr key={client.id} className="border-t border-[color:var(--c-border)] hover:bg-[color:var(--c-bg2,#f9fafb)]">
                  <td className="px-4 py-3 font-medium text-[color:var(--c-text)]">{client.name}</td>
                  <td className="px-4 py-3 text-[color:var(--c-text2)]">{client.email}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 text-xs font-medium bg-[color:var(--c-primary)] text-white rounded-full opacity-80">
                      {client.industry}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-[color:var(--c-text)]">{client.totalEmailsSent}</td>
                  <td className="px-4 py-3 text-center text-[color:var(--c-text)]">{client.emailsSinceLastInvoice}</td>
                  <td className="px-4 py-3 text-[color:var(--c-text2)]">{formatDate(client.lastInvoiceDate)}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => setEditClient(client)}
                      className="text-xs px-3 py-1 bg-[color:var(--c-primary)] text-white rounded hover:opacity-90 mr-2"
                      title="Klant bewerken"
                    >
                      Bewerken
                    </button>
                    <button
                      onClick={() => setInvoiceClient(client)}
                      className="text-xs px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 mr-2"
                    >
                      Factuur
                    </button>
                    <button
                      onClick={() => handleDelete(client.id)}
                      className="text-xs px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Verwijderen
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AddClientModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onCreated={fetchClients}
      />

      <EditClientModal
        isOpen={!!editClient}
        onClose={() => setEditClient(null)}
        client={editClient}
        onUpdated={fetchClients}
      />

      <InvoiceGeneratorModal
        isOpen={!!invoiceClient}
        onClose={() => setInvoiceClient(null)}
        client={invoiceClient}
        onGenerated={fetchClients}
      />

      <SendEmailsModal
        isOpen={showSendModal}
        onClose={() => setShowSendModal(false)}
        onConfirm={handleTriggerCron}
        clients={clients}
        loading={triggeringCron}
      />
    </div>
  );
};

export default DashboardPage;
