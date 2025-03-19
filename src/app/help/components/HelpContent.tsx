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
              A modern imageboard platform where users can share images, GIFs, and videos anonymously or with an account.
              Our platform emphasizes privacy, high-quality media sharing, and a customizable user experience with little to zero moderation.
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
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Personalize your name with colors and animations
              </p>
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Colored nickname with gradients</li>
                <li>• Animated avatar frames</li>
                <li>• Custom profile design</li>
              </ul>
            </div>

            <div className="p-4 rounded-lg bg-white/50 dark:bg-gray-800/50">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Enhanced Media 📤</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                GIFs up to 50MB and videos in original quality
              </p>
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Images up to 10MB (instead of 5MB)</li>
                <li>• GIFs up to 50MB (instead of 10MB)</li>
                <li>• Videos in original quality (instead of 720p)</li>
              </ul>
            </div>

            <div className="p-4 rounded-lg bg-white/50 dark:bg-gray-800/50">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Ad-Free 🚫</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Completely ad-free experience
              </p>
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <li>• No advertisements anywhere on the site</li>
                <li>• Cleaner interface without distractions</li>
                <li>• Early access to new features</li>
              </ul>
            </div>

            <div className="p-4 rounded-lg bg-white/50 dark:bg-gray-800/50">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Unlimited Features 🎯</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Unlimited pools, tags & messages
              </p>
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Unlimited private pools (instead of 5)</li>
                <li>• Unlimited tag favorites (instead of 20)</li>
                <li>• Collaborative pools with other users</li>
              </ul>
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
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Account optional, GIFs up to 10MB, videos in 720p
              </p>
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Browse & upload without registration</li>
                <li>• Anonymous sharing for privacy</li>
                <li>• Basic uploads with free limits</li>
              </ul>
            </div>

            <div className="p-4 rounded-lg bg-gray-50/80 dark:bg-gray-800/50">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Tag System 🏷️</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Up to 20 favorites, automatic suggestions
              </p>
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Find content with descriptive tags</li>
                <li>• Add tags to make content discoverable</li>
                <li>• Tag suggestions based on content</li>
              </ul>
            </div>

            <div className="p-4 rounded-lg bg-gray-50/80 dark:bg-gray-800/50">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Pools & Collections 📂</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Create up to 5 public pools
              </p>
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Organize content thematically</li>
                <li>• Public/private visibility options</li>
                <li>• Follow pools for new content</li>
              </ul>
            </div>

            <div className="p-4 rounded-lg bg-gray-50/80 dark:bg-gray-800/50">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Community Features 💬</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Comments, likes, basic notifications
              </p>
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Discuss content with comments</li>
                <li>• Show appreciation with likes</li>
                <li>• Save favorites for later viewing</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Getting Started */}
        <section className="space-y-4">
          <h2 className="text-2xl font-[family-name:var(--font-geist-mono)] text-black dark:text-gray-400">
            Getting Started
          </h2>
          
          <div className="p-4 rounded-lg bg-gray-50/80 dark:bg-gray-800/50">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Using f0ck.org</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Browsing Content 🔍
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Browse content by tags, popular posts, or recent uploads. Filter content by ratings (Safe/Sketchy/Unsafe) according to your preferences in settings.
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Creating an Account 👤
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  While browsing is available without registration, creating an account gives you access to features like favorites, commenting, and content uploading.
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Uploading Content 📤
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Click the upload button, select your file, add appropriate tags and select the correct content rating. Remember to follow our content guidelines.
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Using Tags 🏷️
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Tags help organize and find content. Add relevant tags when uploading, and use tags to search for specific content you are interested in.
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-gray-50/80 dark:bg-gray-800/50">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Content Ratings System</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-500/40 text-white border border-green-500/50">
                  SAFE
                </span>
                <p className="text-xs text-gray-600 dark:text-gray-400">Appropriate for all users (landscapes, animals, non-suggestive content)</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-yellow-500/40 text-white border border-yellow-500/50">
                  SKETCHY
                </span>
                <p className="text-xs text-gray-600 dark:text-gray-400">Suggestive content (artistic nude, cosplay with suggestive poses)</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-500/40 text-white border border-red-500/50">
                  UNSAFE
                </span>
                <p className="text-xs text-gray-600 dark:text-gray-400">Explicit content (artistic NSFW, age verification required)</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="space-y-4">
          <h2 className="text-2xl font-[family-name:var(--font-geist-mono)] text-black dark:text-gray-400">
            Frequently Asked Questions
          </h2>
          
          <div className="p-4 rounded-lg bg-gray-50/80 dark:bg-gray-800/50">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              <div className="py-3">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Do I need an account to use f0ck.org?
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  No, you can browse content without an account. However, creating an account gives you access to uploading, commenting, favorites, and other features.
                </p>
              </div>
              
              <div className="py-3">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  How do content ratings work?
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Content is classified as Safe (appropriate for all), Sketchy (suggestive), or Unsafe (explicit, requires age verification). You can set your viewing preferences in settings.
                </p>
              </div>
              
              <div className="py-3">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  How do I report inappropriate content?
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Use the report button on any post to flag content that violates our rules. Our moderation team reviews all reports and takes appropriate action.
                </p>
              </div>
              
              <div className="py-3">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  What happens if I lose my password?
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  If you added an email to your account, you can use the password recovery option. If you created an account without an email, password recovery is not possible.
                </p>
              </div>
              
              <div className="py-3">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  What are the file size limits?
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Free users: Images up to 5MB, GIFs up to 10MB, Videos in 720p.<br/>
                  Premium users: Images up to 10MB, GIFs up to 50MB, Videos in original quality.
                </p>
              </div>
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
          
          <div className="p-4 rounded-lg bg-gray-50/80 dark:bg-gray-800/50">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Need Help?</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              If you could not find the information you need, feel free to contact our support team:
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Support ✉️</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Contact us at <a href="mailto:mail@f0ck.org" className="text-blue-600 dark:text-blue-400 hover:underline">mail[@]f0ck.org</a>
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Discord Support 🎮</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Get help in the #support channel on our Discord server
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
