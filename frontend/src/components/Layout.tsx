import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import HelpModal from './HelpModal';

const Layout: React.FC = () => {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <Outlet />
      </main>

      <button
        onClick={() => setShowHelp(true)}
        className="fixed bottom-6 right-6 w-12 h-12 bg-[color:var(--c-primary)] text-white rounded-full shadow-lg hover:opacity-90 transition-opacity flex items-center justify-center text-xl font-bold z-40"
        title="Handleiding"
      >
        ?
      </button>

      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </div>
  );
};

export default Layout;
