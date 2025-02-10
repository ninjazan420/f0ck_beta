'use client';
import { getRandomLogo } from "@/lib/utils";
import { Footer } from "@/components/Footer";

export default function Help() {
  return (
    <div className="min-h-[calc(100vh-36.8px)] flex flex-col">
      <div className="w-full flex justify-center py-8">
        <img src={getRandomLogo()} alt="Random Logo" className="h-12" />
      </div>

      <div className="container mx-auto px-4 py-4 max-w-4xl flex-grow">
        <h1 className="text-3xl font-[family-name:var(--font-geist-mono)] mb-8 text-center text-black dark:text-gray-400">
          Help & Features
        </h1>

        {/* Platform Description */}
        <section className="mb-12">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <p className="text-xl text-gray-900 dark:text-gray-200 leading-relaxed font-medium">
              Willkommen bei f0ck.org
            </p>
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Entdecke eine moderne Imageboard-Plattform, die deine Privatsphäre schützt 
                und Benutzerfreundlichkeit in den Mittelpunkt stellt.
              </p>
              <div className="flex flex-col md:flex-row gap-4 justify-center items-center text-gray-700 dark:text-gray-300">
                <div className="flex items-center gap-2">
                  <span className="text-purple-500">✦</span>
                  <span>Anonymes Teilen</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-500">✦</span>
                  <span>Hochwertige Medieninhalte</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-500">✦</span>
                  <span>Premium Features</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="space-y-6">
          {/* Premium Features Section */}
          <section className="p-6 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10 border border-purple-100 dark:border-purple-800/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-[family-name:var(--font-geist-mono)] text-black dark:text-gray-400">
                Premium Features 💎
              </h2>
              <a href="/premium" className="px-3 py-1.5 text-sm rounded-lg bg-purple-600 hover:bg-purple-700 text-white">
                Upgrade
              </a>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-start gap-4 p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">
                    <span className="font-[family-name:var(--font-geist-mono)] inline-flex items-center gap-1">
                      <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent font-semibold">
                        Colored Nickname and Avatar
                      </span>
                      <span className="text-yellow-500 animate-pulse">⭐</span>
                    </span>
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Personalisiere deinen Nickname mit Farben, Gradienten und Animationen
                  </p>
                </div>
                <span className="text-xs text-purple-600 dark:text-purple-400">Premium</span>
              </div>

              <div className="flex justify-between items-start gap-4 p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">Enhanced Uploads 📤</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    GIFs bis 50MB und Videos in Originalqualität
                  </p>
                </div>
                <span className="text-xs text-purple-600 dark:text-purple-400">Premium</span>
              </div>

              <div className="flex justify-between items-start gap-4 p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">Ad-Free Experience 🚫</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Genieße f0ck.org komplett werbefrei
                  </p>
                </div>
                <span className="text-xs text-purple-600 dark:text-purple-400">Premium</span>
              </div>

              <div className="flex justify-between items-start gap-4 p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">Unlimited Features 🎯</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Unbegrenzte Pools, Tag-Favoriten und Privatnachrichten
                  </p>
                </div>
                <span className="text-xs text-purple-600 dark:text-purple-400">Premium</span>
              </div>

              <div className="flex justify-between items-start gap-4 p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">Advanced Notifications 🔔</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Individualisierbare Benachrichtigungen und Filter
                  </p>
                </div>
                <span className="text-xs text-purple-600 dark:text-purple-400">Premium</span>
              </div>
            </div>
          </section>

          {/* Core Features Section */}
          <section className="settings-card">
            <h2 className="text-2xl font-[family-name:var(--font-geist-mono)] mb-4 text-black dark:text-gray-400">
              Basis Features
            </h2>
            
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-gray-50/80 dark:bg-gray-800/50">
                <h3 className="font-medium text-gray-900 dark:text-gray-100">Anonymes Uploading</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Upload ohne Account möglich. GIFs bis 10MB, Videos in 720p.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-gray-50/80 dark:bg-gray-800/50">
                <h3 className="font-medium text-gray-900 dark:text-gray-100">Tag System</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Bis zu 20 Tag-Favoriten, automatische Tag-Vorschläge.
                </p>
              </div>

              {/* Weitere Basis Features... */}
            </div>
          </section>

          {/* Account & Privacy Section */}
          <section className="settings-card">
            <h2 className="text-2xl font-[family-name:var(--font-geist-mono)] mb-4 text-black dark:text-gray-400">
              Account & Privatsphäre
            </h2>
            
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-gray-50/80 dark:bg-gray-800/50">
                <h3 className="font-medium text-gray-900 dark:text-gray-100">Registrierung</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Optional und minimale Datenerfassung. Email ist optional.
                </p>
                <a href="/register" className="text-sm text-purple-600 dark:text-purple-400 hover:underline">
                  Jetzt registrieren →
                </a>
              </div>

              <div className="p-3 rounded-lg bg-gray-50/80 dark:bg-gray-800/50">
                <h3 className="font-medium text-gray-900 dark:text-gray-100">Privatsphäre-Einstellungen</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Volle Kontrolle über sichtbare Informationen und Interaktionen.
                </p>
              </div>
            </div>
          </section>

          {/* File Support Section */}
          <section className="settings-card">
            <h2 className="text-2xl font-[family-name:var(--font-geist-mono)] mb-4 text-black dark:text-gray-400">
              Unterstützte Formate
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-gray-50/80 dark:bg-gray-800/50">
                <h3 className="font-medium text-gray-900 dark:text-gray-100">Bilder</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">.jpg, .png, .avif, .webp</p>
              </div>
              
              <div className="p-3 rounded-lg bg-gray-50/80 dark:bg-gray-800/50">
                <h3 className="font-medium text-gray-900 dark:text-gray-100">Animationen</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">.gif, .apng</p>
              </div>
              
              <div className="p-3 rounded-lg bg-gray-50/80 dark:bg-gray-800/50">
                <h3 className="font-medium text-gray-900 dark:text-gray-100">Videos</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">.mp4, .webm, .mov</p>
              </div>
            </div>
          </section>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
