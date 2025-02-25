'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { StatusBanner } from './StatusBanner';
import { useState } from 'react';

type MenuItem = {
  label: string;
} & (
  | { type: 'link'; href: string }
  | { type: 'button'; onClick: () => void }
  | { type: 'avatar'; component: React.ReactNode }
);

export const Navbar = () => {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const [showLogoutBanner, setShowLogoutBanner] = useState(false);
  const [showSuccessLogout, setShowSuccessLogout] = useState(false);

  const leftMenuItems: MenuItem[] = [
    { type: 'link', label: 'Home', href: '/' },
    { type: 'link', label: 'Posts', href: '/posts' },
    { type: 'link', label: 'Upload', href: '/upload' },
    { type: 'link', label: 'Comments', href: '/comments' },
    { type: 'link', label: 'Tags', href: '/tags' },
    { type: 'link', label: 'Pools', href: '/pools' },
    { type: 'link', label: 'Users', href: '/users' },
  ];

  // Gemeinsame Menüpunkte für alle Benutzer
  const commonMenuItems: MenuItem[] = [
    { type: 'link', label: 'Help', href: '/help' },
    { type: 'link', label: 'Rules', href: '/rules' },
    { type: 'link', label: 'Settings', href: '/settings' },
    { type: 'link', label: 'Premium', href: '/premium' },
  ];

  const handleLogout = async () => {
    setShowLogoutBanner(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setShowLogoutBanner(false);
    setShowSuccessLogout(true);
    signOut({ redirect: true, callbackUrl: '/' });
  };

  const truncateUsername = (username: string | undefined | null): string => {
    if (!username) return 'User';
    return username.length > 12 ? username.substring(0, 12) + '...' : username;
  };

  const getAuthMenuItems = (): MenuItem[] => {
    if (isAuthenticated) {
      return [
        {
          type: 'avatar',
          label: 'Avatar',
          component: (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                <div className="text-xs text-gray-400">
                 {session?.user?.username?.[0]?.toUpperCase() ?? '?'}
                </div>
              </div>
              <Link href="/account" className="font-mono">
                {truncateUsername(session?.user?.username)}
              </Link>
            </div>
          )
        },
        ...commonMenuItems,
        {
          type: 'button',
          label: 'Logout',
          onClick: handleLogout
        }
      ];
    } else {
      return [
        ...commonMenuItems,
        { type: 'link', label: 'Login', href: '/login' },
        { type: 'link', label: 'Register', href: '/register' },
      ];
    }
  };

  return (
    <>
      <StatusBanner show={showLogoutBanner} message="Logging out..." type="default" />
      <StatusBanner show={showSuccessLogout} message="Successfully logged out!" type="success" />
      <nav className="w-full h-[36.8px] border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 h-full">
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center gap-6">
              {leftMenuItems.map((item) => {
                if (item.type !== 'link') return null;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="font-mono text-[1em] hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center gap-6">
              {getAuthMenuItems().map((item) => {
                switch (item.type) {
                  case 'avatar':
                    return <div key={item.label}>{item.component}</div>;
                  case 'button':
                    return (
                      <button
                        key={item.label}
                        onClick={item.onClick}
                        className="font-mono text-[1em] hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      >
                        {item.label}
                      </button>
                    );
                  case 'link':
                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="font-mono text-[1em] hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      >
                        {item.label}
                      </Link>
                    );
                }
              })}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};
