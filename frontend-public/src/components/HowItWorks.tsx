import React from 'react';

const steps = [
  {
    icon: '1',
    title: 'Wij genereren',
    description: 'Onze AI maakt dagelijks unieke, platformspecifieke contentideeën op maat van jouw branche.',
  },
  {
    icon: '2',
    title: 'Wij leveren',
    description: 'Je ontvangt dagelijks een e-mail met kant-en-klare contentideeën inclusief titels, beschrijvingen, hashtags en call-to-actions.',
  },
  {
    icon: '3',
    title: 'Jij groeit',
    description: 'Post consequent op alle platforms, betrek je doelgroep en zie je social media-aanwezigheid groeien.',
  },
];

const HowItWorks: React.FC = () => (
  <section className="py-24">
    <div className="max-w-6xl mx-auto px-6">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Hoe het werkt</h2>
      <p className="text-center text-gray-500 mb-16 max-w-xl mx-auto">
        Drie simpele stappen en je hebt nooit meer een gebrek aan contentideeën.
      </p>
      <div className="grid md:grid-cols-3 gap-10">
        {steps.map((step) => (
          <div key={step.title} className="text-center">
            <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center mx-auto mb-5 text-xl font-bold shadow-md">{step.icon}</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
            <p className="text-gray-500 leading-relaxed">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;
