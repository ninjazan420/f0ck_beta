import { RandomLogo } from "@/components/RandomLogo";
import { Footer } from "@/components/Footer";
import { Metadata } from "next";
import { siteConfig } from "../metadata";

export const metadata: Metadata = {
  title: `Terms of Service | ${siteConfig.name}`,
  description: "Terms of Service and Privacy Policy for f0ck.org",
  icons: {
    icon: [{ url: siteConfig.icon, type: "image/x-icon" }],
  },
};

export default function Terms() {
  return (
    <div className="min-h-[calc(100vh-36.8px)] flex flex-col">
      <div className="w-full flex justify-center py-8">
        <RandomLogo />
      </div>

      <div className="container mx-auto px-4 py-4 max-w-4xl flex-grow">
        <h1 className="text-3xl font-[family-name:var(--font-geist-mono)] mb-8 text-center text-black dark:text-gray-400">
          Terms of Service
        </h1>

        <div className="text-sm text-gray-600 dark:text-gray-400 mb-8 text-center">
          Last updated: July 8, 2025
        </div>

        {/* Service Description */}
        <section className="settings-card mb-6">
          <h2 className="text-2xl font-[family-name:var(--font-geist-mono)] mb-4 text-black dark:text-gray-400">
            About f0ck.org
          </h2>
          
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              f0ck.org is a community-driven image and media sharing platform that allows users to upload, 
              share, and discover content. Our platform supports various content types including images, 
              videos, and GIFs with a comprehensive tagging and rating system.
            </p>
            
            <div className="p-4 rounded-lg bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30">
              <h3 className="font-medium text-blue-900 dark:text-blue-300 mb-2">Open Source Project</h3>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                f0ck.org is an open-source project. You can view our source code, contribute, 
                and report issues on our GitHub repository: 
                <a href="https://github.com/ninjazan420/f0ck_beta" 
                   className="underline ml-1 hover:opacity-80" 
                   target="_blank" 
                   rel="noopener noreferrer">
                  github.com/ninjazan420/f0ck_beta
                </a>
              </p>
            </div>
          </div>
        </section>

        {/* Data Collection & Privacy */}
        <section className="settings-card mb-6">
          <h2 className="text-2xl font-[family-name:var(--font-geist-mono)] mb-4 text-black dark:text-gray-400">
            Data Collection & Privacy
          </h2>
          
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-gray-50/80 dark:bg-gray-800/50">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Account Data</h3>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                <li>Username (required, unique, 3-20 characters)</li>
                <li>Email address (optional, for password recovery)</li>
                <li>Password (hashed with bcrypt, 12 rounds)</li>
                <li>Profile bio (optional, max 140 characters)</li>
                <li>Avatar image (optional)</li>
                <li>Account creation and last seen timestamps</li>
                <li>User role (user, premium, moderator, admin, banned)</li>
              </ul>
            </div>

            <div className="p-3 rounded-lg bg-gray-50/80 dark:bg-gray-800/50">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Discord Integration</h3>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                <li>Discord ID and username (when linking account)</li>
                <li>Discord avatar (automatically synchronized)</li>
                <li>OAuth tokens (securely stored, used for authentication)</li>
                <li>Account linking prevents duplicate registrations</li>
              </ul>
            </div>

            <div className="p-3 rounded-lg bg-gray-50/80 dark:bg-gray-800/50">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Content Data</h3>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                <li>Uploaded images and videos with metadata (dimensions, size, format)</li>
                <li>Post titles, descriptions, and tags</li>
                <li>Content ratings (safe, sketchy, unsafe)</li>
                <li>View counts, likes, dislikes, and favorites</li>
                <li>Comments and user interactions</li>
                <li>Upload timestamps and author information</li>
              </ul>
            </div>

            <div className="p-3 rounded-lg bg-gray-50/80 dark:bg-gray-800/50">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Usage Analytics</h3>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                <li>Notification preferences and history</li>
                <li>User activity for moderation purposes</li>
                <li>No third-party tracking or advertising cookies</li>
              </ul>
            </div>
          </div>
        </section>

        {/* User Rights & Responsibilities */}
        <section className="settings-card mb-6">
          <h2 className="text-2xl font-[family-name:var(--font-geist-mono)] mb-4 text-black dark:text-gray-400">
            User Rights & Responsibilities
          </h2>
          
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-green-50/50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30">
              <h3 className="font-medium text-green-900 dark:text-green-300 mb-2">Your Rights</h3>
              <ul className="list-disc list-inside text-sm text-green-800 dark:text-green-200 space-y-1">
                <li>Access and download your uploaded content</li>
                <li>Delete your account and associated data</li>
                <li>Request data export (contact: mail[@]f0ck.org)</li>
                <li>Appeal moderation decisions</li>
                <li>Use the platform without mandatory email registration</li>
              </ul>
            </div>

            <div className="p-3 rounded-lg bg-orange-50/50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800/30">
              <h3 className="font-medium text-orange-900 dark:text-orange-300 mb-2">Your Responsibilities</h3>
              <ul className="list-disc list-inside text-sm text-orange-800 dark:text-orange-200 space-y-1">
                <li>Only upload content you own or have permission to share</li>
                <li>Properly tag and rate your uploads</li>
                <li>Respect other users and community guidelines</li>
                <li>Report illegal or harmful content</li>
                <li>Maintain account security (strong passwords, secure email)</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Account Recovery & Security */}
        <section className="settings-card mb-6">
          <h2 className="text-2xl font-[family-name:var(--font-geist-mono)] mb-4 text-black dark:text-gray-400">
            Account Recovery & Security
          </h2>
          
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-gray-50/80 dark:bg-gray-800/50">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Password Recovery</h3>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                <li>Email-based password reset (requires registered email)</li>
                <li>Reset tokens expire after 1 hour</li>
                <li>Secure token generation using crypto.randomBytes</li>
                <li>No password recovery without email - choose wisely</li>
              </ul>
            </div>

            <div className="p-3 rounded-lg bg-gray-50/80 dark:bg-gray-800/50">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Discord Account Linking</h3>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                <li>Link existing accounts with Discord for easier access</li>
                <li>Prevents duplicate account creation</li>
                <li>Automatic avatar synchronization</li>
                <li>Secure OAuth 2.0 implementation</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Community & External Links */}
        <section className="settings-card mb-6">
          <h2 className="text-2xl font-[family-name:var(--font-geist-mono)] mb-4 text-black dark:text-gray-400">
            Community & External Services
          </h2>
          
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-gray-50/80 dark:bg-gray-800/50">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Official Links</h3>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                <li>Main site: <a href="https://f0ck.org/" className="underline hover:opacity-80" target="_blank" rel="noopener noreferrer">f0ck.org</a></li>
                <li>Discord server: <a href="https://discord.gg/SmWpwGnyrU" className="underline hover:opacity-80" target="_blank" rel="noopener noreferrer">discord.gg/SmWpwGnyrU</a></li>
                <li>TeamSpeak 3: <a href="ts3server://ts.f0ck.org" className="underline hover:opacity-80" target="_blank" rel="noopener noreferrer">ts.f0ck.org</a></li>
                <li>ShareX Server: <a href="https://sx.f0ck.org" className="underline hover:opacity-80" target="_blank" rel="noopener noreferrer">sx.f0ck.org</a></li>
              </ul>
            </div>

            <div className="p-3 rounded-lg bg-gray-50/80 dark:bg-gray-800/50">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">External Service Integration</h3>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                <li>Discord OAuth for authentication</li>
                <li>Email services for password recovery</li>
                <li>No third-party analytics or advertising</li>
                <li>Self-hosted infrastructure where possible</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Legal & Compliance */}
        <section className="settings-card mb-6">
          <h2 className="text-2xl font-[family-name:var(--font-geist-mono)] mb-4 text-black dark:text-gray-400">
            Legal & Compliance
          </h2>
          
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-red-50/50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30">
              <h3 className="font-medium text-red-900 dark:text-red-300 mb-2">Age Restrictions</h3>
              <p className="text-sm text-red-800 dark:text-red-200">
                This platform is intended for users 18 years and older. By using this service, 
                you confirm that you are at least 18 years old. Accounts suspected of belonging 
                to minors will be suspended immediately.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-gray-50/80 dark:bg-gray-800/50">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Content Liability</h3>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                <li>Users are responsible for their uploaded content</li>
                <li>We reserve the right to remove content without notice</li>
                <li>Illegal content will be reported to authorities</li>
                <li>DMCA takedown requests: mail[@]f0ck.org</li>
              </ul>
            </div>

            <div className="p-3 rounded-lg bg-gray-50/80 dark:bg-gray-800/50">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Service Availability</h3>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                <li>Service provided &quot;as is&quot; without warranties</li>
                <li>No guarantee of 100% uptime</li>
                <li>Regular maintenance may cause temporary outages</li>
                <li>Beta software - features may change</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Contact & Support */}
        <section className="settings-card">
          <h2 className="text-2xl font-[family-name:var(--font-geist-mono)] mb-4 text-black dark:text-gray-400">
            Contact & Support
          </h2>
          
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30">
              <h3 className="font-medium text-blue-900 dark:text-blue-300 mb-2">Get Help</h3>
              <ul className="list-disc list-inside text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>Email support: mail[@]f0ck.org</li>
                <li>Discord community support</li>
                <li>GitHub issues for bug reports</li>
                <li>Response time: Usually within 24-48 hours</li>
              </ul>
            </div>

            <div className="p-3 rounded-lg bg-gray-50/80 dark:bg-gray-800/50">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Changes to Terms</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                We may update these terms from time to time. Significant changes will be 
                announced through our Discord server and on the platform. Continued use 
                of the service constitutes acceptance of updated terms.
              </p>
            </div>
          </div>
        </section>
      </div>
      
      <Footer />
    </div>
  );
}
