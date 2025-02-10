export const Footer = () => {
  // Konstante Build-Informationen mit der letzten Commit-ID
  const BUILD_ID = 'e741671a9f7d607f7e1e8086d312ee446c670cdb';
  const BUILD_DATE = '10 Feb 2024';

  return (
    <footer className="w-full py-8 mt-auto">
      <div className="container mx-auto px-4">
        <ul className="flex flex-wrap justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
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
          <p>Latest build: <a 
            href={`https://github.com/ninjazan420/f0ck_beta/commit/${BUILD_ID}`}
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:underline"
          >
            {BUILD_ID.substring(0, 7)} {/* Zeigt nur die ersten 7 Zeichen der Commit-ID */}
          </a> ({BUILD_DATE})</p>
          <p className="mt-2">Made with ♥ and ☕</p>
        </div>
      </div>
    </footer>
  );
};
