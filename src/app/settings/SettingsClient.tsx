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
    highQualityThumbs: false,
    gridSize: '28' as '28' | '42' | '63' | '88', // 7x4, 7x6, 9x7, 11x8
    gridColumns: '7' as '7' | '9' | '11',
    showAds: true,
    autoplayVideos: true,
    muteAutoplay: true,
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

            <div className="settings-row">
              <span className="font-[family-name:var(--font-geist-sans)] text-gray-900 dark:text-gray-400">
                Autoplay Videos
              </span>
              <label className="toggle-switch">
                <input 
                  type="checkbox"
                  checked={settings.autoplayVideos}
                  onChange={(e) => setSettings(prev => ({ ...prev, autoplayVideos: e.target.checked }))}
                />
                <div className="toggle-switch-background">
                  <div className="toggle-switch-handle"></div>
                </div>
              </label>
            </div>

            <div className="settings-row">
              <span className="font-[family-name:var(--font-geist-sans)] text-gray-900 dark:text-gray-400">
                Mute Autoplay Videos
              </span>
              <label className="toggle-switch">
                <input 
                  type="checkbox"
                  checked={settings.muteAutoplay}
                  onChange={(e) => setSettings(prev => ({ ...prev, muteAutoplay: e.target.checked }))}
                />
                <div className="toggle-switch-background">
                  <div className="toggle-switch-handle"></div>
                </div>
              </label>
            </div>
          </section>

          {/* Content Layout Settings */}
          <section className="settings-card">
            <h2 className="text-2xl font-[family-name:var(--font-geist-mono)] mb-4 text-black dark:text-gray-400">
              Layout Preferences
            </h2>
            
            <div className="settings-row">
              <span className="font-[family-name:var(--font-geist-mono)] text-gray-900 dark:text-gray-400">
                Grid Layout
              </span>
              <select
                value={settings.gridSize}
                onChange={(e) => {
                  const newSize = e.target.value as typeof settings.gridSize;
                  const columns = {
                    '28': '7',
                    '42': '7',
                    '63': '9',
                    '88': '11'
                  }[newSize] as typeof settings.gridColumns;
                  
                  setSettings(prev => ({ 
                    ...prev, 
                    gridSize: newSize,
                    gridColumns: columns
                  }));
                }}
                className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50"
              >
                <option value="28">Standard (7×4)</option>
                <option value="42">Tall (7×6)</option>
                <option value="63">Large (9×7)</option>
                <option value="88">Extra Large (11×8)</option>
              </select>
            </div>

            <div className="settings-row">
              <div className="flex flex-col">
                <span className="font-[family-name:var(--font-geist-mono)] text-gray-900 dark:text-gray-400">
                  Show Advertisements
                </span>
                <span className="text-xs text-purple-500 dark:text-purple-400">
                  Disable ads with Premium 💎
                </span>
              </div>
              <label className="toggle-switch opacity-50 cursor-not-allowed">
                <input 
                  type="checkbox"
                  checked={true}
                  disabled
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
