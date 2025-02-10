import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { getRandomLogo } from "@/lib/utils";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "f0ck beta v1",
  description: "Welcome to f0ck.org",
  icons: {
    icon: '/favicon.ico'
  }
};

export default function Home() {
  const logoSrc = getRandomLogo();
  
  return (
    <div className="min-h-[calc(100vh-36.8px)] flex flex-col items-center p-8">
      <div className="flex-1 flex flex-col items-center justify-center max-w-4xl w-full gap-8">
        {/* Logo Section */}
        <Link href="/" className="relative w-[411px] h-[84px] logo-container">
          <Image
            src={logoSrc}
            alt="f0ck.org Logo"
            fill
            priority
            className="object-contain"
          />
        </Link>

        {/* Welcome Text */}
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-[family-name:var(--font-geist-mono)] text-gray-900 dark:text-gray-400">
            Catmemes, Shitposts, Girls und mehr
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Beta Version 1.0 - Wir bauen etwas Neues.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
          {[
            'Aktive Nutzer', 
            'Kommentare (24h)', 
            'Neue Posts (24h)'
          ].map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="text-2xl font-light tracking-tight text-gray-900 dark:text-gray-400">0</div>
              <div className="text-[13px] font-medium tracking-wide text-gray-500 dark:text-gray-500">
                {stat}
              </div>
            </div>
          ))}
        </div>

        {/* Coming Soon */}
        <div className="mt-8 text-sm text-gray-500 dark:text-gray-400 font-[family-name:var(--font-geist-mono)]">
          Weitere Features folgen...
        </div>
      </div>
      <Footer />
    </div>
  )
}
