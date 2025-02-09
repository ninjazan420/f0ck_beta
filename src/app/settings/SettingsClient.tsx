'use client';

import { Footer } from "@/components/Footer";
import { useTheme } from "@/context/ThemeContext";
import { RandomLogo } from "@/components/RandomLogo";
import { useState, ChangeEvent } from 'react';

export default function SettingsClient() {
  const { theme, toggleTheme } = useTheme();
  const [settings, setSettings] = useState({
    blurNsfw: false,
    showEmail: false,
    allowDm: false,
    autoplayGifs: false,
    highQualityThumbs: false
  });

  const handleSettingChange = (setting: keyof typeof settings) => (e: ChangeEvent<HTMLInputElement>) => {
    setSettings(prev => ({
      ...prev,
      [setting]: e.target.checked
    }));
  };

  return (
    <div className="min-h-[calc(100vh-36.8px)] flex flex-col">
      {/* Logo Section */}
      <div className="w-full flex justify-center py-8">
        <RandomLogo />
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-4 max-w-4xl flex-grow">
        <h1 className="text-3xl font-[family-name:var(--font-geist-mono)] mb-8 text-center text-black dark:text-gray-400">
          Settings
        </h1>

        <div className="space-y-6">
          {/* Appearance Settings */}
          <section className="settings-card">
            <h2 className="text-2xl font-[family-name:var(--font-geist-mono)] mb-4 text-black dark:text-gray-400">
              Appearance
            </h2>
            
            <div className="settings-row">
              <span className="font-[family-name:var(--font-geist-sans)] text-gray-900 dark:text-gray-400">
                Dark Mode
              </span>
              <label className="toggle-switch">
                <input  
                  type="checkbox" 
                  checked={theme === 'dark'}
                  onChange={toggleTheme}
                />
                <div className="toggle-switch-background">
                  <div className="toggle-switch-handle"></div>
                </div>
              </label>
            </div>

            <div className="settings-row">
              <span className="font-[family-name:var(--font-geist-sans)] text-gray-900 dark:text-gray-400">
                Blur NSFW Content
              </span>
              <label className="toggle-switch">
                <input 
                  type="checkbox"
                  checked={settings.blurNsfw}
                  onChange={handleSettingChange('blurNsfw')}
                />
                <div className="toggle-switch-background">
                  <div className="toggle-switch-handle"></div>
                </div>
              </label>
            </div>
          </section>

          {/* Account Settings */}
          <section className="settings-card">
            <h2 className="text-2xl font-[family-name:var(--font-geist-mono)] mb-4 text-black dark:text-gray-400">
              Account
            </h2>
            
            <div className="settings-row">
              <span className="font-[family-name:var(--font-geist-sans)] text-gray-900 dark:text-gray-400">
                Show Email in Profile
              </span>
              <label className="toggle-switch">
                <input 
                  type="checkbox"
                  checked={settings.showEmail}
                  onChange={handleSettingChange('showEmail')}
                />
                <div className="toggle-switch-background">
                  <div className="toggle-switch-handle"></div>
                </div>
              </label>
            </div>

            <div className="settings-row">
              <span className="font-[family-name:var(--font-geist-sans)] text-gray-900 dark:text-gray-400">
                Allow Direct Messages
              </span>
              <label className="toggle-switch">
                <input 
                  type="checkbox"
                  checked={settings.allowDm}
                  onChange={handleSettingChange('allowDm')}
                />
                <div className="toggle-switch-background">
                  <div className="toggle-switch-handle"></div>
                </div>
              </label>
            </div>
          </section>

          {/* Content Preferences */}
          <section className="settings-card">
            <h2 className="text-2xl font-[family-name:var(--font-geist-mono)] mb-4 text-black dark:text-gray-400">
              Content Preferences
            </h2>
            
            <div className="settings-row">
              <span className="font-[family-name:var(--font-geist-sans)] text-gray-900 dark:text-gray-400">
                Auto-play GIFs
              </span>
              <label className="toggle-switch">
                <input 
                  type="checkbox"
                  checked={settings.autoplayGifs}
                  onChange={handleSettingChange('autoplayGifs')}
                />
                <div className="toggle-switch-background">
                  <div className="toggle-switch-handle"></div>
                </div>
              </label>
            </div>

            <div className="settings-row">
              <span className="font-[family-name:var(--font-geist-sans)] text-gray-900 dark:text-gray-400">
                High-Quality Thumbnails
              </span>
              <label className="toggle-switch">
                <input 
                  type="checkbox"
                  checked={settings.highQualityThumbs}
                  onChange={handleSettingChange('highQualityThumbs')}
                />
                <div className="toggle-switch-background">
                  <div className="toggle-switch-handle"></div>
                </div>
              </label>
            </div>
          </section>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
