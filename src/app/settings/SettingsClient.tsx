'use client';
import { Footer } from "@/components/Footer";
import { useTheme } from "@/context/ThemeContext";
import { RandomLogo } from "@/components/RandomLogo";
import { useState, ChangeEvent } from 'react';
import { SettingsPremium } from './SettingsPremium';
import Switch from '@/components/ui/Switch';

interface SettingsClientProps {
  userRole: 'user' | 'premium' | 'moderator' | 'admin' | 'banned';
}

export default function SettingsClient({ userRole = 'user' }: SettingsClientProps) {
  const { theme, toggleTheme } = useTheme();
  const [settings, setSettings] = useState({
    blurNsfw: true,
    autoplayGifs: false,
    autoplayVideos: true,
    muteAutoplay: true,

    // Erweiterte Premium Features
    premium: {
      isActive: false,
      hideAds: false,
      maxGifSize: false,
      keepOriginalVideoQuality: false,
      customGridLayout: false,
      pools: {
        enabled: false,
        maxPools: 5, // Standard: 5, Premium: unlimited
        publicPools: true,
        privatePools: false,
      },
      tags: {
        favorites: false,
        maxFavorites: 20, // Standard: 20, Premium: unlimited
        customCategories: false,
      },
      notifications: {
        customFilters: false,
        mentionAlerts: false,
        tagUpdates: false,
        poolUpdates: false,
        commentReplies: true, // Standard Feature
        directMessages: false,
      },
      messaging: {
        enabled: false,
        maxConversations: 5, // Standard: 5, Premium: unlimited
        attachments: false,
        groupChats: false,
      },
      nickname: {
        enabled: false,
        style: {
          type: 'solid' as 'solid' | 'gradient' | 'animated',
          color: 'purple-600',
          gradient: ['purple-400', 'pink-600'],
          animate: false,
          animation: 'pulse'
        }
      }
    }
  });

  const handleSettingChange = (setting: keyof typeof settings) => (e: ChangeEvent<HTMLInputElement>) => {
    setSettings(prev => ({
      ...prev,
      [setting]: e.target.checked
    }));
  };

  return (
    <div className="min-h-[calc(100vh-36.8px)] flex flex-col">
      <div className="w-full flex justify-center py-8">
        <RandomLogo />
      </div>

      <div className="container mx-auto px-4 py-4 max-w-4xl flex-grow">
        <h1 className="text-3xl font-[family-name:var(--font-geist-mono)] mb-8 text-center text-black dark:text-gray-400">
          Settings (not all settings functional yet)
        </h1>

        <div className="space-y-6">
          <SettingsPremium 
            settings={settings} 
            setSettings={(premiumSettings: any) => {
              setSettings(prevSettings => ({
                ...prevSettings,
                ...premiumSettings
              }))
            }} 
            userRole={userRole}
          />

          {/* General Settings */}
          <section className="settings-card">
            <h2 className="text-2xl font-[family-name:var(--font-geist-mono)] mb-4 text-black dark:text-gray-400">
              General Settings
            </h2>

            <div className="settings-row">
              <span className="font-[family-name:var(--font-geist-sans)] text-gray-900 dark:text-gray-400">
                Dark Mode
              </span>
              <Switch
                checked={theme === "dark"}
                onChange={toggleTheme}
              />
            </div>

            <div className="settings-row">
              <span className="font-[family-name:var(--font-geist-sans)] text-gray-900 dark:text-gray-400">
                Blur NSFW Content
              </span>
              <Switch
                checked={settings.blurNsfw}
                onChange={handleSettingChange("blurNsfw")}
              />
            </div>

            <div className="settings-row">
              <span className="font-[family-name:var(--font-geist-sans)] text-gray-900 dark:text-gray-400">
                Auto-play GIFs
              </span>
              <Switch
                checked={settings.autoplayGifs}
                onChange={handleSettingChange("autoplayGifs")}
              />
            </div>

            <div className="settings-row">
              <span className="font-[family-name:var(--font-geist-sans)] text-gray-900 dark:text-gray-400">
                Autoplay Videos
              </span>
              <Switch
                checked={settings.autoplayVideos}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    autoplayVideos: e.target.checked,
                  }))
                }
              />
            </div>

            <div className="settings-row">
              <span className="font-[family-name:var(--font-geist-sans)] text-gray-900 dark:text-gray-400">
                Mute Autoplay Videos
              </span>
              <Switch
                checked={settings.muteAutoplay}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    muteAutoplay: e.target.checked,
                  }))
                }
              />
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}
