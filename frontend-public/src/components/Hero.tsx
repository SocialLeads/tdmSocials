import React from 'react';

const Hero: React.FC = () => (
  <header className="bg-gradient-to-br from-primary to-purple-700 text-white">
    <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="h-9 w-9 bg-white/20 rounded-lg flex items-center justify-center">
          <span className="font-bold text-lg">T</span>
        </div>
        <span className="text-xl font-bold">TDM Socials</span>
      </div>
      <a
        href="#contact"
        className="hidden sm:inline-block text-sm font-medium bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
      >
        Contact Us
      </a>
    </nav>

    <div className="max-w-6xl mx-auto px-6 pt-16 pb-24 text-center">
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight tracking-tight">
        AI-Powered Social Media Content
        <br className="hidden md:block" />
        <span className="text-indigo-200">Delivered to Your Inbox Daily</span>
      </h1>
      <p className="text-lg md:text-xl text-indigo-100 mb-10 max-w-2xl mx-auto leading-relaxed">
        Get fresh, industry-specific content ideas for TikTok, Instagram,
        Facebook, and Twitter every single day. Just open, post, and grow.
      </p>
      <a
        href="#contact"
        className="inline-block bg-white text-primary font-semibold px-8 py-3.5 rounded-xl shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all"
      >
        Get Started Today
      </a>
    </div>
  </header>
);

export default Hero;
