import React from 'react';
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react';
import { UserIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store';
import { authService } from '../services/auth.service';

const UserMenu: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, currentUser } = useAppSelector((state) => state.user);

  const handleSignOut = async () => {
    await authService.signOut();
    navigate('/login');
  };

  const handleSignIn = () => {
    navigate('/login');
  };

  return (
    <Menu as="div" className="relative">
      <MenuButton className="bg-[color:var(--c-bg)] p-1 rounded-full text-[color:var(--c-text2)] hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[color:var(--c-primary)] focus:ring-offset-[color:var(--c-bg)]">
        <span className="sr-only">Gebruikersmenu openen</span>
        <UserIcon className="h-8 w-8" />
      </MenuButton>
      <MenuItems className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-[color:var(--c-surface)] border border-[color:var(--c-border)] focus:outline-none">
        {isAuthenticated ? (
          <>
            <div className="px-4 py-2 text-xs text-[color:var(--c-text2)] border-b border-[color:var(--c-border)]">
              {currentUser?.email}
            </div>
            <MenuItem>
              <button
                onClick={handleSignOut}
                className="data-[active]:bg-[color:var(--c-border)] block w-full text-left px-4 py-2 text-sm text-[color:var(--c-text)]"
              >
                Uitloggen
              </button>
            </MenuItem>
          </>
        ) : (
          <MenuItem>
            <button
              onClick={handleSignIn}
              className="data-[active]:bg-[color:var(--c-border)] block w-full text-left px-4 py-2 text-sm text-[color:var(--c-text)]"
            >
              Inloggen
            </button>
          </MenuItem>
        )}
      </MenuItems>
    </Menu>
  );
};

export default UserMenu;
