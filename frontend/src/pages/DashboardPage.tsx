import React, { useState, useEffect, useCallback } from 'react';
import { clientsApi, Client } from '../api/clients.api';
import AddClientModal from '../components/AddClientModal';
import EditClientModal from '../components/EditClientModal';
import InvoiceGeneratorModal from '../components/InvoiceGeneratorModal';

const DashboardPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [invoiceClient, setInvoiceClient] = useState<Client | null>(null);
  const [triggeringCron, setTriggeringCron] = useState(false);
  const [cronResult, setCronResult] = useState<string | null>(null);

  const fetchClients = useCallback(async () => {
    try {
      const data = await clientsApi.getAll();
      setClients(data);
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this client?')) return;
    try {
      await clientsApi.delete(id);
      fetchClients();
    } catch (error) {
      console.error('Failed to delete client:', error);
    }
  };

  const handleTriggerCron = async () => {
    setTriggeringCron(true);
    setCronResult(null);
    try {
      const result = await clientsApi.triggerDailyCron();
      setCronResult(`Sent: ${result.sent}, Failed: ${result.failed}`);
      fetchClients();
    } catch (error) {
      setCronResult('Failed to trigger cron');
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
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[color:var(--c-text)]">Clients</h1>
        <div className="flex gap-3">
          <button
            onClick={handleTriggerCron}
            disabled={triggeringCron}
            className="px-4 py-2 text-sm font-medium border border-[color:var(--c-border)] text-[color:var(--c-text)] rounded-lg hover:bg-[color:var(--c-bg2,#f3f4f6)] disabled:opacity-50"
          >
            {triggeringCron ? 'Sending...' : 'Send Daily Emails'}
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 text-sm font-medium bg-[color:var(--c-primary)] text-white rounded-lg hover:opacity-90"
          >
            + Add Client
          </button>
        </div>
      </div>

      {cronResult && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
          {cronResult}
        </div>
      )}

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name, email, or industry..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-[color:var(--c-border)] rounded-lg bg-[color:var(--c-bg)] text-[color:var(--c-text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--c-primary)]"
        />
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-[color:var(--c-text2)]">Loading...</p>
      ) : filteredClients.length === 0 ? (
        <div className="text-center py-12 text-[color:var(--c-text2)]">
          <p className="text-lg mb-2">No clients yet</p>
          <p className="text-sm">Add your first client to get started.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[color:var(--c-border)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[color:var(--c-bg2,#f9fafb)]">
                <th className="text-left px-4 py-3 font-medium text-[color:var(--c-text2)]">Name</th>
                <th className="text-left px-4 py-3 font-medium text-[color:var(--c-text2)]">Email</th>
                <th className="text-left px-4 py-3 font-medium text-[color:var(--c-text2)]">Industry</th>
                <th className="text-center px-4 py-3 font-medium text-[color:var(--c-text2)]">Total Emails</th>
                <th className="text-center px-4 py-3 font-medium text-[color:var(--c-text2)]">Since Invoice</th>
                <th className="text-left px-4 py-3 font-medium text-[color:var(--c-text2)]">Last Invoice</th>
                <th className="text-right px-4 py-3 font-medium text-[color:var(--c-text2)]">Actions</th>
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
                      title="Edit client"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setInvoiceClient(client)}
                      className="text-xs px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 mr-2"
                    >
                      Invoice
                    </button>
                    <button
                      onClick={() => handleDelete(client.id)}
                      className="text-xs px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Delete
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
    </div>
  );
};

export default DashboardPage;
