import { RandomLogo } from "@/components/RandomLogo";
import { Footer } from "@/components/Footer";


export default function Rules() {
  return (
    <div className="min-h-[calc(100vh-36.8px)] flex flex-col">
      <div className="w-full flex justify-center py-8">
        <RandomLogo />
      </div>

      <div className="container mx-auto px-4 py-4 max-w-4xl flex-grow">
        <h1 className="text-3xl font-[family-name:var(--font-geist-mono)] mb-8 text-center text-black dark:text-gray-400">
          Rules & Policies
        </h1>

        {/* Content Rating Section */}
        <section className="settings-card mb-6">
          <h2 className="text-2xl font-[family-name:var(--font-geist-mono)] mb-4 text-black dark:text-gray-400">
            Content Rating System
          </h2>
          
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-green-50/50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded text-sm font-medium bg-green-500/40 text-white border border-green-500/50">
                  SAFE
                </span>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">Safe for all users</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                • Generally appropriate content<br />
                • Artwork without suggestive content<br />
                • Landscapes, animals, objects<br />
                • Cosplay and photography without suggestive poses<br />
                • Suitable for public display
              </p>
            </div>

            <div className="p-4 rounded-lg bg-yellow-50/50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800/30">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded text-sm font-medium bg-yellow-500/40 text-white border border-yellow-500/50">
                  SKETCHY
                </span>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">Suggestive content</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                • Suggestive or mildly erotic content<br />
                • Artistic nude representations<br />
                • Cosplay with suggestive poses<br />
                • Slightly risqué content<br />
                • Not suitable for public display
              </p>
            </div>

            <div className="p-4 rounded-lg bg-red-50/50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded text-sm font-medium bg-red-500/40 text-white border border-red-500/50">
                  UNSAFE
                </span>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">Explicit content</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                • Explicit erotic content<br />
                • Artistic NSFW content<br />
                • Only visible to registered users<br />
                • Hidden/blurred by default<br />
                • Strict age verification required
              </p>
            </div>
          </div>
        </section>

        {/* Prohibited Content Section */}
        <section className="settings-card mb-6">
          <h2 className="text-2xl font-[family-name:var(--font-geist-mono)] mb-4 text-black dark:text-gray-400">
            Prohibited Content
          </h2>
          
          <div className="p-6 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-red-100/50 dark:bg-red-900/30">
                <h3 className="font-medium text-red-900 dark:text-red-300 mb-2">Illegal Content</h3>
                <ul className="list-disc list-inside text-sm text-red-800 dark:text-red-200 space-y-1">
                  <li>Minors in any context - Will be reported</li>
                  <li>Non-consensual content of any kind</li>
                  <li>Real violence</li>
                  <li>Animal abuse</li>
                </ul>
              </div>

              <div className="p-3 rounded-lg bg-red-100/50 dark:bg-red-900/30">
                <h3 className="font-medium text-red-900 dark:text-red-300 mb-2">Personal Data</h3>
                <ul className="list-disc list-inside text-sm text-red-800 dark:text-red-200 space-y-1">
                  <li>Private information of others</li>
                  <li>Doxxing and identity theft</li>
                  <li>Unauthorized private recordings</li>
                  <li>Personal contact information</li>
                </ul>
              </div>

              <div className="p-3 rounded-lg bg-red-100/50 dark:bg-red-900/30">
                <h3 className="font-medium text-red-900 dark:text-red-300 mb-2">Harmful Content</h3>
                <ul className="list-disc list-inside text-sm text-red-800 dark:text-red-200 space-y-1">
                  <li>Malware and harmful software</li>
                  <li>Phishing and scam attempts</li>
                  <li>Spam and ad bots</li>
                  <li>Mass advertising without permission</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* General Rules Section */}
        <section className="settings-card mb-6">
          <h2 className="text-2xl font-[family-name:var(--font-geist-mono)] mb-4 text-black dark:text-gray-400">
            General Rules
          </h2>
          
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-gray-50/80 dark:bg-gray-800/50">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Tagging & Categorization</h3>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                <li>All uploads must be properly tagged</li>
                <li>Minimum 3 descriptive tags per upload</li>
                <li>No misleading or troll tags</li>
                <li>Correct content rating (Safe/Sketchy/Unsafe)</li>
              </ul>
            </div>

            <div className="p-3 rounded-lg bg-gray-50/80 dark:bg-gray-800/50">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Comments & Interaction</h3>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                <li>Be respectful to other users</li>
                <li>No insults or hate speech</li>
                <li>No spam comments or chain letters</li>
                <li>Constructive criticism is welcome</li>
              </ul>
            </div>

            <div className="p-3 rounded-lg bg-gray-50/80 dark:bg-gray-800/50">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Upload Rules</h3>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                <li>Only own works or with permission</li>
                <li>Credit original creators</li>
                <li>No duplicate uploads</li>
                <li>Adequate image quality (min 500px width)</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Account Policies Section */}
        <section className="settings-card mb-6">
          <h2 className="text-2xl font-[family-name:var(--font-geist-mono)] mb-4 text-black dark:text-gray-400">
            Account Policies
          </h2>
          
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-gray-50/80 dark:bg-gray-800/50">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Account Security</h3>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                <li>No account sharing or selling</li>
                <li>Strong passwords required</li>
                <li>2FA recommended</li>
                <li>Maximum security settings for NSFW access</li>
              </ul>
              <div className="mt-3 p-2 rounded bg-amber-50/50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30">
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  ⚠️ Important: Accounts created without an email address CANNOT be recovered if the password is lost. This is a strict policy with no exceptions - choose wisely during registration! You can always add an email address later in your account settings while logged in.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-gray-50/80 dark:bg-gray-800/50">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Age Restrictions</h3>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                <li>Minimum age: 18 years</li>
                <li>No underage users</li>
                <li>Account suspension upon suspicion</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Consequences Section */}
        <section className="settings-card">
          <h2 className="text-2xl font-[family-name:var(--font-geist-mono)] mb-4 text-black dark:text-gray-400">
            Violation Consequences
          </h2>
          
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-gray-50/80 dark:bg-gray-800/50">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Tier System</h3>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                <li>First warning for minor violations</li>
                <li>Temporary ban for repeated violations</li>
                <li>Permanent ban for severe violations</li>
                <li>Immediate deletion of illegal content</li>
              </ul>
            </div>

            <div className="p-3 rounded-lg bg-gray-50/80 dark:bg-gray-800/50">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Moderation Actions</h3>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                <li>Content removal without notice</li>
                <li>Account restrictions</li>
              </ul>
            </div>

            <div className="p-3 rounded-lg bg-gray-50/80 dark:bg-gray-800/50">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Appeals</h3>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                <li>Appeals against warnings possible</li>
                <li>Support contact: support@f0ck.org</li>
                <li>Review by moderators</li>
                <li>Case-by-case decisions</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
      
      <Footer />
    </div>
  );
}
