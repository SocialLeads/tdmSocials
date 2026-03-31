import React from 'react';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import Platforms from './components/Platforms';
import Industries from './components/Industries';
import ContactForm from './components/ContactForm';
import Footer from './components/Footer';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Hero />
      <HowItWorks />
      <Platforms />
      <Industries />
      <ContactForm />
      <Footer />
    </div>
  );
};

export default App;
