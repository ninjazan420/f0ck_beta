import { Inter } from 'next/font/google'
import { JetBrains_Mono } from 'next/font/google'
import './globals.css'
import '../styles/gif-autoplay.css'
import { Navbar } from '@/components/Navbar'
import { ThemeProvider } from '@/context/ThemeContext'
import AuthProvider from '@/context/AuthProvider'
import { AuthProvider as AuthContextProvider } from '@/app/contexts/AuthContext'
import { PageMetaProvider } from '@/context/PageMetaContext'
import { AutoPageMetaUpdater } from '@/components/PageMetaUpdater'
import { AgeVerificationBanner } from '@/components/AgeVerificationBanner'
import { siteConfig } from './metadata'
import type { Metadata } from 'next'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const jetBrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono' })

// Keep initialization code but make it run only once
let hasInitialized = false;

if (!hasInitialized) {
  import('@/lib/init').then(({ initializeDatabase }) => {
    initializeDatabase().catch(console.error);
    hasInitialized = true;
  });
}

export const metadata: Metadata = {
  title: "Home | " + siteConfig.name,
  description:
    "Discover f0ck.org, the anonymous imageboard. Share, rate & comment on images, videos and take part in creative cat memes. Enjoy full transparancy, anonymity and little to none moderation.",
  icons: siteConfig.icon,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetBrainsMono.variable} antialiased`}>
        <AuthProvider>
          <AuthContextProvider>
            <ThemeProvider>
              <PageMetaProvider>
                <AutoPageMetaUpdater />
                <AgeVerificationBanner />
                <Navbar />
                {children}
              </PageMetaProvider>
            </ThemeProvider>
          </AuthContextProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
