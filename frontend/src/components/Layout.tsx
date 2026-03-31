import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16"> {/* pt-16 to account for fixed navbar */}
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
