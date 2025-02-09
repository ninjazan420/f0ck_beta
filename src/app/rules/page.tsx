import Image from "next/image";
import Link from "next/link";
import { getRandomLogo } from "@/lib/utils";
import { Footer } from "@/components/Footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rules & Policies - f0ck beta v1",
  description: "Important rules and policies for using f0ck.org. Please read carefully before participating.",
  openGraph: {
    title: "Rules & Policies - f0ck beta v1",
    description: "Important rules and policies for using f0ck.org",
    images: ["/logos/1.png"],
  },
};

export default function Rules() {
  const logoSrc = getRandomLogo();

  return (
    <div className="min-h-[calc(100vh-36.8px)] flex flex-col">
      {/* Logo Section */}
      <div className="w-full flex justify-center py-8">
        <Link href="/" className="relative w-[308px] h-[63px] logo-container">
          <Image
            src={logoSrc}
            alt="f0ck.org Logo"
            fill
            priority
            className="object-contain"
          />
        </Link>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-4 max-w-4xl flex-grow">
        <h1 className="text-3xl font-[family-name:var(--font-geist-mono)] mb-8 text-center">
          Rules & Policies
        </h1>

        <section className="mb-8">
          <h2 className="text-2xl font-[family-name:var(--font-geist-mono)] mb-4">Terms of Use</h2>
          <div className="space-y-2 font-[family-name:var(--font-geist-sans)] text-gray-900 dark:text-gray-400">
            <p>• f0ck.org is provided to you without any warranty, express or implied.</p>
            <p>• f0ck reserves the right to delete your account or content without explanation.</p>
            <p>• f0ck reserves the right to change these terms of use.</p>
            <p>• The use of the website is strictly for individuals aged 18 and older.</p>
            <p>• Erotic content must be marked as Sketchy, NSFL content as Unsafe.</p>
            <p>• Troll tags and malicious tagging are prohibited.</p>
            <p>• Personal, non-commercial use only.</p>
            <p>• No spamming, advertising, or disruptive behavior.</p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-[family-name:var(--font-geist-mono)] mb-4">Prohibited Content</h2>
          <div className="p-6 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
            <div className="space-y-2 font-[family-name:var(--font-geist-sans)] text-gray-900 dark:text-gray-400">
              <p>• Child pornography - Will be reported to authorities</p>
              <p>• Zoophilia</p>
              <p>• Extreme content (mutilation, brutality, etc.)</p>
              <p>• Personal information of third parties</p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-[family-name:var(--font-geist-mono)] mb-4">Privacy Policy</h2>
          <div className="space-y-2 font-[family-name:var(--font-geist-sans)] text-gray-900 dark:text-gray-400">
            <p>• No personal data storage</p>
            <p>• System logs are completely disabled</p>
            <p>• Anonymous uploads available</p>
            <p>• No permanent IP storage</p>
            <p>• Essential cookies only</p>
            <p>• No tracking or external analytics</p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-[family-name:var(--font-geist-mono)] mb-4">Contact & DMCA</h2>
          <div className="space-y-2 font-[family-name:var(--font-geist-sans)] text-gray-900 dark:text-gray-400">
            <p>General Contact: mail[at]f0ck.org</p>
            <p>DMCA Notices: dmca@f0ck.org</p>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
