'use client';
import { RandomLogo } from "@/components/RandomLogo";
import { Footer } from "@/components/Footer";

export default function Help() {
  return (
    <div className="min-h-[calc(100vh-36.8px)] flex flex-col">
      <div className="w-full flex justify-center py-8">
        <RandomLogo />
      </div>

      <div className="container mx-auto px-4 py-4 max-w-4xl flex-grow">
        <h1 className="text-3xl font-[family-name:var(--font-geist-mono)] mb-8 text-center text-black dark:text-gray-400">
          Help & Features
        </h1>

        {/* Platform Description */}
        <section className="mb-12">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <p className="text-xl text-gray-900 dark:text-gray-200 leading-relaxed font-medium">
              Welcome to f0ck.org
            </p>
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Discover a modern imageboard platform that protects your privacy
                and puts user-friendliness first.
              </p>
              <div className="flex flex-col md:flex-row gap-4 justify-center items-center text-gray-700 dark:text-gray-300">
                <div className="flex items-center gap-2">
                  <span className="text-purple-500">✦</span>
                  <span>Anonymous Sharing</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-500">✦</span>
                  <span>High-Quality Media</span>
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
                    Personalize your nickname with colors, gradients, and animations
                  </p>
                </div>
                <span className="text-xs text-purple-600 dark:text-purple-400">Premium</span>
              </div>

              <div className="flex justify-between items-start gap-4 p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">Enhanced Uploads 📤</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    GIFs up to 50MB and videos in original quality
                  </p>
                </div>
                <span className="text-xs text-purple-600 dark:text-purple-400">Premium</span>
              </div>

              <div className="flex justify-between items-start gap-4 p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">Ad-Free Experience 🚫</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Enjoy f0ck.org completely ad-free
                  </p>
                </div>
                <span className="text-xs text-purple-600 dark:text-purple-400">Premium</span>
              </div>

              <div className="flex justify-between items-start gap-4 p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">Unlimited Features 🎯</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Unlimited pools, tag favorites, and private messages
                  </p>
                </div>
                <span className="text-xs text-purple-600 dark:text-purple-400">Premium</span>
              </div>

              <div className="flex justify-between items-start gap-4 p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">Advanced Notifications 🔔</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Customizable notifications and filters
                  </p>
                </div>
                <span className="text-xs text-purple-600 dark:text-purple-400">Premium</span>
              </div>
            </div>
          </section>

          {/* Core Features Section */}
          <section className="settings-card">
            <h2 className="text-2xl font-[family-name:var(--font-geist-mono)] mb-4 text-black dark:text-gray-400">
              Core Features
            </h2>
            
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-gray-50/80 dark:bg-gray-800/50">
                <h3 className="font-medium text-gray-900 dark:text-gray-100">Anonymous Uploading</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Upload without an account. GIFs up to 10MB, videos in 720p.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-gray-50/80 dark:bg-gray-800/50">
                <h3 className="font-medium text-gray-900 dark:text-gray-100">Tag System</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Up to 20 tag favorites, automatic tag suggestions.
                </p>
              </div>

              {/* More Core Features... */}
            </div>
          </section>

          {/* Account & Privacy Section */}
          <section className="settings-card">
            <h2 className="text-2xl font-[family-name:var(--font-geist-mono)] mb-4 text-black dark:text-gray-400">
              Account & Privacy
            </h2>
            
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-gray-50/80 dark:bg-gray-800/50">
                <h3 className="font-medium text-gray-900 dark:text-gray-100">Registration</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Optional and minimal data collection. Email is optional.
                </p>
                <a href="/register" className="text-sm text-purple-600 dark:text-purple-400 hover:underline">
                  Register now →
                </a>
              </div>

              <div className="p-3 rounded-lg bg-gray-50/80 dark:bg-gray-800/50">
                <h3 className="font-medium text-gray-900 dark:text-gray-100">Privacy Settings</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Full control over visible information and interactions.
                </p>
              </div>
            </div>
          </section>

          {/* File Support Section */}
          <section className="settings-card">
            <h2 className="text-2xl font-[family-name:var(--font-geist-mono)] mb-4 text-black dark:text-gray-400">
              Supported Formats
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-gray-50/80 dark:bg-gray-800/50">
                <h3 className="font-medium text-gray-900 dark:text-gray-100">Images</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">.jpg, .png, .avif, .webp</p>
              </div>
              
              <div className="p-3 rounded-lg bg-gray-50/80 dark:bg-gray-800/50">
                <h3 className="font-medium text-gray-900 dark:text-gray-100">Animations</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">.gif, .apng</p>
              </div>
              
              <div className="p-3 rounded-lg bg-gray-50/80 dark:bg-gray-800/50">
                <h3 className="font-medium text-gray-900 dark:text-gray-100">Videos</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">.mp4, .webm, .mov</p>
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
                  Join our Discord for support and updates
                </p>
              </a>

              <a href="https://ko-fi.com/f0ck_org"
                 className="p-4 rounded-lg bg-gray-50/80 dark:bg-gray-800/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
                <h3 className="font-medium text-gray-900 dark:text-gray-100">Support Us ❤️</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Support the project on Ko-fi
                </p>
              </a>
            </div>
          </section>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
