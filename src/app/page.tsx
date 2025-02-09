import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/Footer";

// Da Next.js Server Components verwendet, wird dies bei jedem Request neu ausgeführt
function getRandomLogo() {
  const totalLogos = 2; // Anzahl der Logos anpassen (1.png, 2.png, etc.)
  const randomNumber = Math.floor(Math.random() * totalLogos) + 1;
  return `/logos/${randomNumber}.png`;  // Pfad jetzt relativ zum public Ordner
}

export default function Home() {
  const logoSrc = getRandomLogo();
  
  return (
    <div className="min-h-screen flex flex-col items-center p-8">
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
          <h1 className="text-2xl font-[family-name:var(--font-geist-mono)]">
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
              <div className="text-2xl font-light tracking-tight">0</div>
              <div className="text-[13px] font-medium tracking-wide text-gray-500 dark:text-gray-400">
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
