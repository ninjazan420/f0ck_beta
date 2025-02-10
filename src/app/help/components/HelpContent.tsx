'use client';

export function HelpContent() {
  return (
    <div className="space-y-8">
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
              A modern imageboard platform focused on privacy and user experience.
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

      {/* Premium Features Section */}
      <div className="space-y-6">
        <section className="p-6 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10 border border-purple-100 dark:border-purple-800/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-[family-name:var(--font-geist-mono)] text-black dark:text-gray-400">
              Premium Features 💎
            </h2>
            <a href="/premium" className="px-3 py-1.5 text-sm rounded-lg bg-purple-600 hover:bg-purple-700 text-white">
              Upgrade
            </a>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 rounded-lg bg-white/50 dark:bg-gray-800/50">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">
                <span className="font-[family-name:var(--font-geist-mono)] inline-flex items-center gap-1">
                  <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent font-semibold">
                    Custom Styling
                  </span>
                  <span className="text-yellow-500 animate-pulse">⭐</span>
                </span>
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Personalize your name with colors and animations
              </p>
            </div>

            <div className="p-4 rounded-lg bg-white/50 dark:bg-gray-800/50">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Enhanced Media 📤</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                GIFs up to 50MB and videos in original quality
              </p>
            </div>

            <div className="p-4 rounded-lg bg-white/50 dark:bg-gray-800/50">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Ad-Free 🚫</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Completely ad-free experience
              </p>
            </div>

            <div className="p-4 rounded-lg bg-white/50 dark:bg-gray-800/50">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Unlimited Features 🎯</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Unlimited pools, tags & messages
              </p>
            </div>
          </div>
        </section>

        {/* Core Features */}
        <section className="space-y-4">
          <h2 className="text-2xl font-[family-name:var(--font-geist-mono)] text-black dark:text-gray-400">
            Core Features
          </h2>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 rounded-lg bg-gray-50/80 dark:bg-gray-800/50">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Anonymous Uploading 🎭</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Account optional, GIFs up to 10MB, videos in 720p
              </p>
            </div>

            <div className="p-4 rounded-lg bg-gray-50/80 dark:bg-gray-800/50">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Tag System 🏷️</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Up to 20 favorites, automatic suggestions
              </p>
            </div>

            <div className="p-4 rounded-lg bg-gray-50/80 dark:bg-gray-800/50">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Pools & Collections 📂</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Create up to 5 public pools
              </p>
            </div>

            <div className="p-4 rounded-lg bg-gray-50/80 dark:bg-gray-800/50">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Community Features 💬</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Comments, likes, basic notifications
              </p>
            </div>
          </div>
        </section>

        {/* Support Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-[family-name:var(--font-geist-mono)] text-black dark:text-gray-400">
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
  );
}
