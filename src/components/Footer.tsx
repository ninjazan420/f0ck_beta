import Link from 'next/link';

export const Footer = () => {
  return (
    <footer className="w-full py-8 mt-auto">
      <div className="container mx-auto px-4">
        <ul className="flex flex-wrap justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <li><Link href="/" className="bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity font-medium">Home</Link></li>
          <li>•</li>
          <li><a href="https://f0ck.org/" target="_blank" rel="noopener noreferrer">f0ck Main</a></li>
          <li>•</li>
          <li><a href="https://ko-fi.com/f0ck_org" target="_blank" rel="noopener noreferrer">Support us</a></li>
          <li>•</li>
          <li><a href="https://discord.gg/SmWpwGnyrU" target="_blank" rel="noopener noreferrer">Discord</a></li>
          <li>•</li>
          <li><a href="ts3server://ts.f0ck.org">TeamSpeak 3</a></li>
          <li>•</li>
          <li><a href="https://sx.f0ck.org" target="_blank" rel="noopener noreferrer">f0ck.org ShareX Server</a></li>
        </ul>
        
        <div className="mt-4 text-center text-xs text-gray-500 dark:text-gray-500">
          <p className="mt-2">Made with ♥ and ☕</p>
        </div>
      </div>
    </footer>
  );
};
