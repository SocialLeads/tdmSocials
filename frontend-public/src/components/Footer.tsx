import React from 'react';

const Footer: React.FC = () => (
  <footer className="py-10 bg-gray-900 text-gray-400">
    <div className="max-w-6xl mx-auto px-6 text-center">
      <div className="flex items-center justify-center gap-3 mb-4">
        <img src="/tdmsocials-icon.svg" alt="TDM Socials" className="h-8 w-8 rounded-lg" />
        <span className="text-white font-semibold text-lg">TDM Socials</span>
      </div>
      <p className="text-sm mb-2">Dagelijks AI-gestuurde social media contentideeën voor jouw bedrijf.</p>
      <p className="text-xs text-gray-500">
        &copy; {new Date().getFullYear()} TDM Socials. Alle rechten voorbehouden. |{' '}
        <a href="mailto:info@tdmsocials.nl" className="hover:text-gray-300 transition-colors">info@tdmsocials.nl</a>
      </p>
    </div>
  </footer>
);

export default Footer;
