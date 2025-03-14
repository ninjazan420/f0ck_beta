'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { StatusBanner } from './StatusBanner';
import { useState, useEffect } from 'react';
import { usePageMeta } from '@/context/PageMetaContext';
import Image from 'next/image';
import { getImageUrlWithCacheBuster } from '@/lib/utils';
import { NotificationBell } from './NotificationBell';

type MenuItem = {
  label: string;
} & (
  | { type: 'link'; href: string }
  | { type: 'button'; onClick: () => void }
  | { type: 'avatar'; component: React.ReactNode }
);

export const Navbar = () => {
  const { data: session, status, update: updateSession } = useSession();
  const isAuthenticated = status === 'authenticated';
  const [showLogoutBanner, setShowLogoutBanner] = useState(false);
  const [showSuccessLogout, setShowSuccessLogout] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);
  
  // Import der Seitenmetadaten
  const { title, description } = usePageMeta();

  // Avatar-Aktualisierungs-Listener
  useEffect(() => {
    const handleAvatarUpdate = () => {
      // Force rerender
      setForceUpdate(prev => prev + 1);
      
      // Force session refresh
      updateSession();
    };
    
    window.addEventListener('avatar-updated', handleAvatarUpdate);
    
    return () => {
      window.removeEventListener('avatar-updated', handleAvatarUpdate);
    };
  }, [updateSession]);

  // Erkennen der Bildschirmgröße
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint in Tailwind
    };
    
    // Initial check
    checkIfMobile();
    
    // Event Listener for Resize
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);
  
  // Close menu when page changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [title]);

  // Debug output
  console.log('Session:', session);
  console.log('User role:', session?.user?.role);
  console.log('Auth status:', status);

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
    try {
      setShowLogoutBanner(true);
      await signOut({ 
        redirect: false
      });
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setShowLogoutBanner(false);
      setShowSuccessLogout(true);
    }
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
                {session?.user?.avatar ? (
                  <Image 
                    key={`avatar-${forceUpdate}-${session.user.avatar}`}
                    src={getImageUrlWithCacheBuster(session.user.avatar)} 
                    alt="Avatar" 
                    width={24} 
                    height={24} 
                    className="object-cover w-full h-full"
                    unoptimized={true}
                  />
                ) : (
                  <div className="text-xs text-gray-400">
                    {session?.user?.username?.[0]?.toUpperCase() ?? '?'}
                  </div>
                )}
              </div>
              <Link href="/account" className="font-mono">
                {truncateUsername(session?.user?.username)}
              </Link>
              <NotificationBell />
            </div>
          )
        },
        ...(session?.user?.role && ['moderator', 'admin'].includes(session.user.role)) 
          ? [{ type: 'link' as const, label: 'Mod', href: '/moderation' }] 
          : [],
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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  // Alle Menüpunkte für Mobile (links + rechts)
  const allMobileMenuItems = [...leftMenuItems, ...getAuthMenuItems()];

  return (
    <>
      <StatusBanner show={showLogoutBanner} message="Logging out..." type="default" />
      <StatusBanner show={showSuccessLogout} message="Successfully logged out!" type="success" />
      <nav className="w-full border-b border-gray-200 dark:border-gray-800 relative z-20">
        {/* Desktop Navbar */}
        <div className={`container mx-auto px-4 h-[36.8px] ${isMobile ? 'hidden' : 'block'}`}>
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
        
        {/* Mobile Navbar */}
        <div className={`container mx-auto px-4 h-[50px] ${isMobile ? 'flex' : 'hidden'} items-center justify-between`}>
          {/* Burger icon */}
          <button 
            onClick={toggleMobileMenu} 
            className="w-8 h-8 flex flex-col justify-center items-center gap-[5px] focus:outline-none"
            aria-label="Toggle menu"
          >
            <span className={`block h-[2px] w-5 bg-current transition-transform duration-300 ${isMobileMenuOpen ? 'transform rotate-45 translate-y-[6px]' : ''}`}></span>
            <span className={`block h-[2px] w-5 bg-current transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`block h-[2px] w-5 bg-current transition-transform duration-300 ${isMobileMenuOpen ? 'transform -rotate-45 -translate-y-[6px]' : ''}`}></span>
          </button>
          
          {/* Page title and description (mobile) */}
          <div className="flex-1 text-center">
            <h1 className="text-base font-[family-name:var(--font-geist-mono)] truncate">{title}</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{description}</p>
          </div>
          
          {/* User avatar (if logged in) */}
          {isAuthenticated && (
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700">
              <Link href="/account">
                {session?.user?.avatar ? (
                  <Image 
                    key={`avatar-${forceUpdate}-${session.user.avatar}`}
                    src={getImageUrlWithCacheBuster(session.user.avatar)} 
                    alt="Avatar" 
                    width={32} 
                    height={32} 
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="text-sm text-gray-400">
                    {session?.user?.username?.[0]?.toUpperCase() ?? '?'}
                  </div>
                )}
              </Link>
            </div>
          )}
        </div>
        
        {/* Mobile menu dropdown */}
        {isMobile && (
          <div 
            className={`absolute w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-lg transition-max-height duration-300 ease-in-out overflow-hidden z-30 ${
              isMobileMenuOpen ? 'max-h-[85vh] overflow-y-auto' : 'max-h-0'
            }`}
          >
            <div className="container mx-auto py-2">
              {/* Avatar area */}
              {isAuthenticated && (
                <div className="flex items-center gap-3 px-4 py-3 mb-2 border-b border-gray-100 dark:border-gray-800">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                    {session?.user?.avatar ? (
                      <Image 
                        key={`avatar-${forceUpdate}-${session.user.avatar}`}
                        src={getImageUrlWithCacheBuster(session.user.avatar)} 
                        alt="Avatar" 
                        width={40} 
                        height={40} 
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="text-lg text-gray-500 dark:text-gray-400">
                        {session?.user?.username?.[0]?.toUpperCase() ?? '?'}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-mono font-medium">{truncateUsername(session?.user?.username)}</div>
                    <Link href="/account" className="text-xs text-purple-600 dark:text-purple-400">
                      Manage profile
                    </Link>
                  </div>
                </div>
              )}
              
              {/* Hauptnavigation */}
              <div className="px-4 mb-3">
                <h3 className="text-xs uppercase font-medium text-gray-500 dark:text-gray-400 mb-1 ml-1">Navigation</h3>
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl overflow-hidden">
                  {leftMenuItems.map((item, index) => {
                    if (item.type !== 'link') return null;
                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center py-3 px-4 font-mono text-[1em] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                          index < leftMenuItems.length - 1 ? 'border-b border-gray-100 dark:border-gray-800/60' : ''
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
              
              {/* Kontobereich */}
              {isAuthenticated ? (
                <div className="px-4 mb-3">
                  <h3 className="text-xs uppercase font-medium text-gray-500 dark:text-gray-400 mb-1 ml-1">Konto</h3>
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl overflow-hidden">
                    {session?.user?.role && ['moderator', 'admin'].includes(session.user.role) && (
                      <Link
                        href="/moderation"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center py-3 px-4 font-mono text-[1em] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-800/60"
                      >
                        Moderation
                      </Link>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full text-left py-3 px-4 font-mono text-[1em] text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <div className="px-4 mb-3">
                  <h3 className="text-xs uppercase font-medium text-gray-500 dark:text-gray-400 mb-1 ml-1">Konto</h3>
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl overflow-hidden">
                    <Link
                      href="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center py-3 px-4 font-mono text-[1em] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-800/60"
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center py-3 px-4 font-mono text-[1em] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      Register
                    </Link>
                  </div>
                </div>
              )}
              
              {/* Weitere Links */}
              <div className="px-4 mb-3">
                <h3 className="text-xs uppercase font-medium text-gray-500 dark:text-gray-400 mb-1 ml-1">Weitere Links</h3>
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl overflow-hidden">
                  {commonMenuItems.map((item, index) => {
                    if (item.type !== 'link') return null;
                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center py-3 px-4 font-mono text-[1em] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                          index < commonMenuItems.length - 1 ? 'border-b border-gray-100 dark:border-gray-800/60' : ''
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
              
              {/* Fußzeile */}
              <div className="px-4 pt-2 pb-4 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  &copy; {new Date().getFullYear()} f0ck.org
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Overlay to close menu when clicking outside */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/20 dark:bg-black/50 z-20" 
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
        )}
      </nav>
    </>
  );
};
