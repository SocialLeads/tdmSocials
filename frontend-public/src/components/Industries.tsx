import React from 'react';

const industries = [
  'Automotive', 'Vastgoed', 'Fitness', 'Horeca', 'Beauty/Salon',
  'Gezondheidszorg', 'Juridisch', 'Financieel', 'Onderwijs', 'Technologie',
  'E-commerce', 'Bouw', 'Fotografie', 'Reizen', 'Dierenverzorging',
  'Schoonmaak', 'Hoveniers', 'Tandheelkunde', 'Chiropractie', 'HVAC',
  'Loodgieters', 'Elektra', 'Dakdekkers', 'Verzekeringen', 'Accountancy',
  'Marketingbureau', 'Bruiloften/Evenementen', 'Food & Beverage', 'Mode', 'Woondecoratie',
];

const Industries: React.FC = () => (
  <section className="py-20">
    <div className="max-w-6xl mx-auto px-6">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Wij bedienen 30+ branches</h2>
      <p className="text-center text-gray-500 mb-12">Content specifiek afgestemd op jouw branche.</p>
      <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
        {industries.map((ind) => (
          <span key={ind} className="px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium border border-indigo-100">{ind}</span>
        ))}
      </div>
    </div>
  </section>
);

export default Industries;
