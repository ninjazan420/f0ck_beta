'use client';
import { Footer } from "@/components/Footer";
import { useTheme } from "@/context/ThemeContext";
import { RandomLogo } from "@/components/RandomLogo";
import { useState, ChangeEvent, useEffect } from 'react';
import { SettingsPremium } from './SettingsPremium';
import Switch from '@/components/ui/Switch';
import { useSettings } from '@/hooks/useSettings';

interface SettingsClientProps {
  userRole: 'user' | 'premium' | 'moderator' | 'admin' | 'banned';
}

export default function SettingsClient({ userRole = 'user' }: SettingsClientProps) {
  const { theme, toggleTheme } = useTheme();
  const { settings: userSettings, updateSetting } = useSettings();
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

  // Load initial settings from localStorage on component mount
  useEffect(() => {
    const storedSettings = localStorage.getItem('settings');
    if (storedSettings) {
      try {
        const parsedSettings = JSON.parse(storedSettings);
        setSettings(prev => ({
          ...prev,
          blurNsfw: parsedSettings.blurNsfw !== undefined ? parsedSettings.blurNsfw : prev.blurNsfw,
          autoplayGifs: parsedSettings.autoplayGifs !== undefined ? parsedSettings.autoplayGifs : prev.autoplayGifs,
          autoplayVideos: parsedSettings.autoplayVideos !== undefined ? parsedSettings.autoplayVideos : prev.autoplayVideos,
          muteAutoplay: parsedSettings.muteAutoplay !== undefined ? parsedSettings.muteAutoplay : prev.muteAutoplay
        }));
      } catch (error) {
        console.error('Failed to parse settings from localStorage:', error);
      }
    }
  }, []);

  const handleSettingChange = (setting: keyof typeof settings) => (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.checked;
    setSettings(prev => ({
      ...prev,
      [setting]: newValue
    }));
    
    // Update localStorage
    const storedSettings = localStorage.getItem('settings');
    const parsedSettings = storedSettings ? JSON.parse(storedSettings) : {};
    localStorage.setItem('settings', JSON.stringify({
      ...parsedSettings,
      [setting]: newValue
    }));
    
    // Update global settings state
    updateSetting(setting as keyof typeof userSettings, newValue);
  };

  return (
    <div className="min-h-[calc(100vh-36.8px)] flex flex-col">
      <div className="w-full flex justify-center py-8">
        <RandomLogo />
      </div>

      <div className="container mx-auto px-4 py-4 max-w-4xl flex-grow">
        <h1 className="text-3xl font-[family-name:var(--font-geist-mono)] mb-8 text-center text-[var(--text-primary)]">
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
            <h2 className="text-2xl font-[family-name:var(--font-geist-mono)] mb-4 text-[var(--text-primary)]">
              General Settings
            </h2>

            <div className="settings-row">
              <span className="font-[family-name:var(--font-geist-sans)] text-[var(--text-primary)]">
                Dark Mode
              </span>
              <Switch
                checked={theme === "dark"}
                onChange={toggleTheme}
              />
            </div>

            <div className="settings-row">
              <span className="font-[family-name:var(--font-geist-sans)] text-[var(--text-primary)]">
                Blur NSFW Content
              </span>
              <Switch
                checked={settings.blurNsfw}
                onChange={handleSettingChange("blurNsfw")}
              />
            </div>

            <div className="settings-row">
              <span className="font-[family-name:var(--font-geist-sans)] text-[var(--text-primary)]">
                Auto-play GIFs
              </span>
              <Switch
                checked={settings.autoplayGifs}
                onChange={handleSettingChange("autoplayGifs")}
              />
            </div>

            <div className="settings-row">
              <span className="font-[family-name:var(--font-geist-sans)] text-[var(--text-primary)]">
                Autoplay Videos
              </span>
              <Switch
                checked={settings.autoplayVideos}
                onChange={handleSettingChange("autoplayVideos")}
              />
            </div>

            <div className="settings-row">
              <span className="font-[family-name:var(--font-geist-sans)] text-[var(--text-primary)]">
                Mute Autoplay Videos
              </span>
              <Switch
                checked={settings.muteAutoplay}
                onChange={handleSettingChange("muteAutoplay")}
              />
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}
