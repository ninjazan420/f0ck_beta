import Link from 'next/link';

export const Navbar = () => {
  const leftMenuItems = [
    { label: 'Home', href: '/' },
    { label: 'Posts', href: '/posts' },
    { label: 'Upload', href: '/upload' },
    { label: 'Comments', href: '/comments' },
    { label: 'Tags', href: '/tags' },
    { label: 'Pools', href: '/pools' },
    { label: 'Catalog', href: '/catalog' },
    { label: 'User', href: '/user' },
  ];

  const rightMenuItems = [
    { label: 'Account', href: '/account' },
    { label: 'Register', href: '/register' },
    { label: 'Help', href: '/help' },
    { label: 'Rules', href: '/rules' },
    { label: 'Settings', href: '/settings' },
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
              <Link 
                key={item.label}
                href={item.href} 
                className="font-[family-name:var(--font-geist-mono)] text-[1em] hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};
