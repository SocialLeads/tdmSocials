import React from 'react';

const industries = [
  'Automotive', 'Real Estate', 'Fitness', 'Restaurant', 'Beauty/Salon',
  'Healthcare', 'Legal', 'Finance', 'Education', 'Technology',
  'E-commerce', 'Construction', 'Photography', 'Travel', 'Pet Care',
  'Cleaning Services', 'Landscaping', 'Dental', 'Chiropractic', 'HVAC',
  'Plumbing', 'Electrical', 'Roofing', 'Insurance', 'Accounting',
  'Marketing Agency', 'Wedding/Events', 'Food & Beverage', 'Fashion', 'Home Decor',
];

const Industries: React.FC = () => (
  <section className="py-20">
    <div className="max-w-6xl mx-auto px-6">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
        We Serve 30+ Industries
      </h2>
      <p className="text-center text-gray-500 mb-12">
        Content tailored specifically to your business niche.
      </p>
      <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
        {industries.map((ind) => (
          <span
            key={ind}
            className="px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium border border-indigo-100"
          >
            {ind}
          </span>
        ))}
      </div>
    </div>
  </section>
);

export default Industries;
