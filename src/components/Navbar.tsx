import Link from 'next/link';
import Image from 'next/image';

// Mock user data - später durch echte User-Daten ersetzen
const mockUser = {
  name: 'User123',
  avatar: null // null für Default-Avatar
};

export const Navbar = () => {
  const leftMenuItems = [
    { label: 'Home', href: '/' },
    { label: 'Posts', href: '/posts' },
    { label: 'Upload', href: '/upload' },
    { label: 'Comments', href: '/comments' },
    { label: 'Tags', href: '/tags' },
    { label: 'Pools', href: '/pools' },
    { label: 'Users', href: '/users' },
  ];

  const rightMenuItems = [
    { 
      type: 'avatar',
      component: (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700">
            {mockUser.avatar ? (
              <Image 
                src={mockUser.avatar}
                alt="User avatar"
                width={24}
                height={24}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-xs text-gray-400">
                {mockUser.name[0].toUpperCase()}
              </div>
            )}
          </div>
          <Link 
            href="/account" 
            className="font-[family-name:var(--font-geist-mono)] text-[1em] hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            Account
          </Link>
        </div>
      )
    },
    { label: 'Register', href: '/register' },
    { label: 'Help', href: '/help' },
    { label: 'Rules', href: '/rules' },
    { label: 'Settings', href: '/settings' },
    { label: 'Premium', href: '/premium' },
  ];

  return (
    <nav className="w-full h-[36.8px] border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Left Menu Group */}
          <div className="flex items-center gap-6">
            {leftMenuItems.map((item) => (
              <Link 
                key={item.label}
                href={item.href} 
                className="font-[family-name:var(--font-geist-mono)] text-[1em] hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right Menu Group */}
          <div className="flex items-center gap-6">
            {rightMenuItems.map((item) => (
              item.type === 'avatar' ? (
                <div key="avatar">{item.component}</div>
              ) : (
                <Link 
                  key={item.label}
                  href={item.href!} 
                  className="font-[family-name:var(--font-geist-mono)] text-[1em] hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {item.label}
                </Link>
              )
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};
