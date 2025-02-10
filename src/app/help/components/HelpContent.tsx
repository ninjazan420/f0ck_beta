'use client';

export const metadata: Metadata = {
  title: "Posts - f0ck beta v1",
  description: "Browse through posts"
};

export function HelpContent() {
  return (
    <>
      <h1 className="text-3xl font-[family-name:var(--font-geist-mono)] mb-8 text-center text-black dark:text-gray-400">
        Help & Features
      </h1>

      {/* Platform Description */}
      <section className="mb-8">
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          f0ck.org kombiniert moderne Technologie mit maximaler Privatsphäre. 
          Teile und entdecke Medieninhalte - anonym oder mit Account. 
          Mit Premium erhältst du Zugriff auf exklusive Features und ein werbefreies Erlebnis.
        </p>
      </section>

      <div className="space-y-6">
        {/* Premium Features Section */}
        <section className="p-6 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10 border border-purple-100 dark:border-purple-800/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-[family-name:var(--font-geist-mono)] text-black dark:text-gray-400">
              Premium Features 💎
            </h2>
            <a href="/premium" className="px-3 py-1.5 text-sm rounded-lg bg-purple-600 hover:bg-purple-700 text-white">
              Get Premium
            </a>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 rounded-lg bg-white/50 dark:bg-gray-800/50">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                Colored Nickname and Avatars 
                <span className="text-yellow-500 animate-[spin_2s_linear_infinite]">⭐</span>
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Personalisiere deinen Namen mit Farben, Gradienten und Animationen
              </p>
            </div>

            <div className="p-4 rounded-lg bg-white/50 dark:bg-gray-800/50">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Enhanced Media 📤</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                GIFs bis 50MB und Videos in Originalqualität
              </p>
            </div>

            <div className="p-4 rounded-lg bg-white/50 dark:bg-gray-800/50">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Ad-Free 🚫</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Komplett werbefreies Erlebnis auf allen Seiten
              </p>
            </div>

            <div className="p-4 rounded-lg bg-white/50 dark:bg-gray-800/50">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Unlimited Features 🎯</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Unbegrenzte Pools, Tags & Nachrichten
              </p>
            </div>
          </div>
        </section>

        {/* Core Features */}
        <section className="settings-card">
          <h2 className="text-2xl font-[family-name:var(--font-geist-mono)] mb-4 text-black dark:text-gray-400">
            Basis Features
          </h2>
          
          <div className="grid gap-3 md:grid-cols-2">
            <div className="p-4 rounded-lg bg-gray-50/80 dark:bg-gray-800/50">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Anonymes Uploading 🎭</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Account optional, GIFs bis 10MB, Videos in 720p
              </p>
            </div>

            <div className="p-4 rounded-lg bg-gray-50/80 dark:bg-gray-800/50">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Tag System 🏷️</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Bis zu 20 Favoriten, automatische Vorschläge
              </p>
            </div>

            <div className="p-4 rounded-lg bg-gray-50/80 dark:bg-gray-800/50">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Pools & Collections 📂</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Erstelle bis zu 5 öffentliche Pools
              </p>
            </div>

            <div className="p-4 rounded-lg bg-gray-50/80 dark:bg-gray-800/50">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Community Features 💬</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Kommentare, Likes, basic Benachrichtigungen
              </p>
            </div>
          </div>
        </section>

        {/* Getting Started */}
        <section className="settings-card">
          <h2 className="text-2xl font-[family-name:var(--font-geist-mono)] mb-4 text-black dark:text-gray-400">
            Getting Started
          </h2>
          
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-gray-50/80 dark:bg-gray-800/50">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Quick Start 🚀</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>1. Erstelle optional einen Account</li>
                <li>2. Lade Medien hoch oder browse die Galerie</li>
                <li>3. Nutze Tags zum besseren Finden</li>
                <li>4. Erstelle Pools für deine Sammlungen</li>
                <li>5. Interagiere mit der Community</li>
              </ul>
            </div>

            <div className="p-4 rounded-lg bg-gray-50/80 dark:bg-gray-800/50">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Unterstützte Formate 📄</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300">Bilder</h4>
                  <p className="text-gray-600 dark:text-gray-400">.jpg, .png, .webp</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300">Animationen</h4>
                  <p className="text-gray-600 dark:text-gray-400">.gif, .apng</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300">Videos</h4>
                  <p className="text-gray-600 dark:text-gray-400">.mp4, .webm</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Support Section */}
        <section className="settings-card">
          <h2 className="text-2xl font-[family-name:var(--font-geist-mono)] mb-4 text-black dark:text-gray-400">
            Support & Community
          </h2>
          
          <div className="grid gap-4 md:grid-cols-2">
            <a href="https://discord.gg/SmWpwGnyrU" 
               className="p-4 rounded-lg bg-gray-50/80 dark:bg-gray-800/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Discord Community 💬</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Tritt unserem Discord bei für Support und Updates
              </p>
            </a>

            <a href="https://ko-fi.com/f0ck_org"
               className="p-4 rounded-lg bg-gray-50/80 dark:bg-gray-800/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Support Us ❤️</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Unterstütze das Projekt auf Ko-fi
              </p>
            </a>
          </div>
        </section>
      </div>
    </>
  );
}
