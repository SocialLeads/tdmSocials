import React from 'react';

const steps = [
  {
    icon: '1',
    title: 'We Generate',
    description:
      'Our AI creates unique, platform-specific content ideas tailored to your industry every single day.',
  },
  {
    icon: '2',
    title: 'We Deliver',
    description:
      'You receive a daily email with ready-to-use content ideas complete with titles, descriptions, hashtags, and calls-to-action.',
  },
  {
    icon: '3',
    title: 'You Grow',
    description:
      'Post consistently across all platforms, engage your audience, and watch your social media presence take off.',
  },
];

const HowItWorks: React.FC = () => (
  <section className="py-24">
    <div className="max-w-6xl mx-auto px-6">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
        How It Works
      </h2>
      <p className="text-center text-gray-500 mb-16 max-w-xl mx-auto">
        Three simple steps to never run out of content ideas again.
      </p>

      <div className="grid md:grid-cols-3 gap-10">
        {steps.map((step) => (
          <div key={step.title} className="text-center">
            <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center mx-auto mb-5 text-xl font-bold shadow-md">
              {step.icon}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              {step.title}
            </h3>
            <p className="text-gray-500 leading-relaxed">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;
