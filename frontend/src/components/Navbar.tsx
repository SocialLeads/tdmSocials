import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import UserMenu from './UserMenu';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-[color:var(--c-bg)] shadow-sm border-b border-[color:var(--c-border)] fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <img src={`${process.env.PUBLIC_URL}/tdmsocials-logo.svg`} alt="TDM Socials" className="h-12" />
            </Link>
          </div>

          <div className="hidden md:block ml-8">
            <div className="flex items-baseline space-x-6">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `${isActive ? 'text-[color:var(--c-primary)]' : 'text-[color:var(--c-text2)]'} hover:text-[color:var(--c-primary)] px-3 py-2 rounded-md text-sm font-medium transition-colors`
                }
              >
                Overzicht
              </NavLink>
            </div>
          </div>

          <div className="flex-1"></div>

          <div className="flex items-center">
            <UserMenu />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
