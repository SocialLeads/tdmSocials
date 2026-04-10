import React, { useState } from 'react';

const API_BASE = process.env.REACT_APP_API_BASE_URL || '';

const ContactForm: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setResult(null);
    try {
      const response = await fetch(`${API_BASE}/admin/contact`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message, website }),
      });
      if (!response.ok) throw new Error('Verzenden mislukt');
      setResult({ type: 'success', text: 'Bericht verzonden! We nemen snel contact met je op.' });
      setName(''); setEmail(''); setMessage('');
    } catch {
      setResult({ type: 'error', text: 'Bericht verzenden mislukt. Probeer het later opnieuw.' });
    } finally { setLoading(false); }
  };

  return (
    <section id="contact" className="py-24 bg-white">
      <div className="max-w-xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Neem contact op</h2>
        <p className="text-center text-gray-500 mb-10">Geïnteresseerd in dagelijkse contentideeën voor jouw bedrijf? Neem contact op en we helpen je op weg.</p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Naam</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow" placeholder="Je naam" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">E-mail</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow" placeholder="jij@voorbeeld.nl" />
          </div>
          <div className="absolute -left-[9999px]" aria-hidden="true">
            <label>Website</label>
            <input type="text" value={website} onChange={(e) => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Bericht</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} required className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow resize-none" placeholder="Vertel ons over je bedrijf en wat je zoekt..." />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-primary text-white font-semibold py-3 rounded-xl hover:bg-primary-dark disabled:opacity-50 transition-colors shadow-md hover:shadow-lg">
            {loading ? 'Verzenden...' : 'Bericht versturen'}
          </button>
          {result && (
            <div className={`text-center text-sm p-3 rounded-xl border ${result.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>{result.text}</div>
          )}
        </form>
      </div>
    </section>
  );
};

export default ContactForm;
