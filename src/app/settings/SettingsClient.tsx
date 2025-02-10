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

    // Upload Settings
    uploadSettings: {
      maxGifSize: false, // false = 10MB, true = 50MB (Premium)
      keepOriginalVideoQuality: false, // false = 720p max, true = original (Premium)
      autoTag: true,
      defaultPrivacy: 'public' as 'public' | 'private' | 'unlisted',
      defaultContentRating: 'safe' as 'safe' | 'sketchy' | 'unsafe'
    },

    // Erweiterte Grid-Einstellungen
    gridLayout: {
      columns: 7,
      rows: 4,
      customLayout: false, // Premium Feature
    },

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
          {/* Premium Features - Jetzt als erste Sektion */}
          <section className="settings-card bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-[family-name:var(--font-geist-mono)] text-black dark:text-gray-400">
                Premium Features 💎
              </h2>
              {!settings.premium.isActive && (
                <a href="/premium" className="px-3 py-1.5 text-sm rounded-lg bg-purple-600 hover:bg-purple-700 text-white">
                  Upgrade
                </a>
              )}
            </div>

            <div className="space-y-4">
              <div className="settings-row">
                <div className="flex flex-col">
                  <span className="font-[family-name:var(--font-geist-mono)] text-gray-900 dark:text-gray-400">
                    GIF Upload Size
                  </span>
                  <span className="text-xs text-gray-500">
                    {settings.premium.maxGifSize ? 'Up to 50MB' : 'Up to 10MB (50MB with premium)'}
                  </span>
                </div>
                <label className={`toggle-switch ${!settings.premium.isActive && 'opacity-50 cursor-not-allowed'}`}>
                  <input 
                    type="checkbox"
                    checked={settings.premium.maxGifSize}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      premium: { ...prev.premium, maxGifSize: e.target.checked }
                    }))}
                    disabled={!settings.premium.isActive}
                  />
                  <div className="toggle-switch-background">
                    <div className="toggle-switch-handle"></div>
                  </div>
                </label>
              </div>

              <div className="settings-row">
                <div className="flex flex-col">
                  <span className="font-[family-name:var(--font-geist-mono)] text-gray-900 dark:text-gray-400">
                    Original Video Quality
                  </span>
                  <span className="text-xs text-gray-500">
                    {settings.premium.keepOriginalVideoQuality ? 'Keep original resolution' : 'Rendered down to 720p | Premium keep original resolution'}
                  </span>
                </div>
                <label className={`toggle-switch ${!settings.premium.isActive && 'opacity-50 cursor-not-allowed'}`}>
                  <input 
                    type="checkbox"
                    checked={settings.premium.keepOriginalVideoQuality}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      premium: { ...prev.premium, keepOriginalVideoQuality: e.target.checked }
                    }))}
                    disabled={!settings.premium.isActive}
                  />
                  <div className="toggle-switch-background">
                    <div className="toggle-switch-handle"></div>
                  </div>
                </label>
              </div>

              <div className="settings-row">
                <div className="flex flex-col">
                  <span className="font-[family-name:var(--font-geist-mono)] text-gray-900 dark:text-gray-400">
                    Hide Advertisements
                  </span>
                  <span className="text-xs text-gray-500">Remove all ads from the site</span>
                </div>
                <label className={`toggle-switch ${!settings.premium.isActive && 'opacity-50 cursor-not-allowed'}`}>
                  <input 
                    type="checkbox"
                    checked={settings.premium.hideAds}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      premium: { ...prev.premium, hideAds: e.target.checked }
                    }))}
                    disabled={!settings.premium.isActive}
                  />
                  <div className="toggle-switch-background">
                    <div className="toggle-switch-handle"></div>
                  </div>
                </label>
              </div>

              {/* Neue Premium Features */}
              <div className="settings-row">
                <div className="flex flex-col">
                  <span className="font-[family-name:var(--font-geist-mono)] text-gray-900 dark:text-gray-400">
                    Custom Pools (Albums)
                  </span>
                  <span className="text-xs text-gray-500">
                    Create unlimited public & private pools
                  </span>
                </div>
                <label className={`toggle-switch ${!settings.premium.isActive && 'opacity-50 cursor-not-allowed'}`}>
                  <input 
                    type="checkbox"
                    checked={settings.premium.pools.enabled}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      premium: { 
                        ...prev.premium, 
                        pools: {
                          ...prev.premium.pools,
                          enabled: e.target.checked,
                          privatePools: e.target.checked
                        }
                      }
                    }))}
                    disabled={!settings.premium.isActive}
                  />
                  <div className="toggle-switch-background">
                    <div className="toggle-switch-handle"></div>
                  </div>
                </label>
              </div>

              <div className="settings-row">
                <div className="flex flex-col">
                  <span className="font-[family-name:var(--font-geist-mono)] text-gray-900 dark:text-gray-400">
                    Advanced Tag Features
                  </span>
                  <span className="text-xs text-gray-500">
                    Unlimited tag favorites & custom categories
                  </span>
                </div>
                <label className={`toggle-switch ${!settings.premium.isActive && 'opacity-50 cursor-not-allowed'}`}>
                  <input 
                    type="checkbox"
                    checked={settings.premium.tags.favorites}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      premium: {
                        ...prev.premium,
                        tags: {
                          ...prev.premium.tags,
                          favorites: e.target.checked,
                          customCategories: e.target.checked
                        }
                      }
                    }))}
                    disabled={!settings.premium.isActive}
                  />
                  <div className="toggle-switch-background">
                    <div className="toggle-switch-handle"></div>
                  </div>
                </label>
              </div>

              <div className="settings-row">
                <div className="flex flex-col">
                  <span className="font-[family-name:var(--font-geist-mono)] text-gray-900 dark:text-gray-400">
                    Enhanced Notifications
                  </span>
                  <span className="text-xs text-gray-500">
                    Custom filters & advanced alerts
                  </span>
                </div>
                <label className={`toggle-switch ${!settings.premium.isActive && 'opacity-50 cursor-not-allowed'}`}>
                  <input 
                    type="checkbox"
                    checked={settings.premium.notifications.customFilters}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      premium: {
                        ...prev.premium,
                        notifications: {
                          ...prev.premium.notifications,
                          customFilters: e.target.checked,
                          mentionAlerts: e.target.checked,
                          tagUpdates: e.target.checked,
                          poolUpdates: e.target.checked
                        }
                      }
                    }))}
                    disabled={!settings.premium.isActive}
                  />
                  <div className="toggle-switch-background">
                    <div className="toggle-switch-handle"></div>
                  </div>
                </label>
              </div>

              <div className="settings-row">
                <div className="flex flex-col">
                  <span className="font-[family-name:var(--font-geist-mono)] text-gray-900 dark:text-gray-400">
                    Private Messaging
                  </span>
                  <span className="text-xs text-gray-500">
                    Unlimited conversations & attachments
                  </span>
                </div>
                <label className={`toggle-switch ${!settings.premium.isActive && 'opacity-50 cursor-not-allowed'}`}>
                  <input 
                    type="checkbox"
                    checked={settings.premium.messaging.enabled}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      premium: {
                        ...prev.premium,
                        messaging: {
                          ...prev.premium.messaging,
                          enabled: e.target.checked,
                          attachments: e.target.checked,
                          groupChats: e.target.checked
                        }
                      }
                    }))}
                    disabled={!settings.premium.isActive}
                  />
                  <div className="toggle-switch-background">
                    <div className="toggle-switch-handle"></div>
                  </div>
                </label>
              </div>
            </div>
          </section>

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
            
            <div className="space-y-4">
              <div className="settings-row">
                <div className="flex flex-col">
                  <span className="font-[family-name:var(--font-geist-mono)] text-gray-900 dark:text-gray-400">
                    Custom Grid Layout
                  </span>
                  <span className="text-xs text-gray-500">
                    Customize your viewing experience
                  </span>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox"
                    checked={settings.gridLayout.customLayout}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      gridLayout: { ...prev.gridLayout, customLayout: e.target.checked }
                    }))}
                  />
                  <div className="toggle-switch-background">
                    <div className="toggle-switch-handle"></div>
                  </div>
                </label>
              </div>

              {settings.gridLayout.customLayout && (
                <div className="space-y-4 p-4 bg-gray-100/50 dark:bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Columns ({settings.gridLayout.columns})
                      </label>
                      <input
                        type="range"
                        min="4"
                        max="14"
                        value={settings.gridLayout.columns}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          gridLayout: { ...prev.gridLayout, columns: parseInt(e.target.value) }
                        }))}
                        className="w-full"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Rows ({settings.gridLayout.rows})
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="8"
                        value={settings.gridLayout.rows}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          gridLayout: { ...prev.gridLayout, rows: parseInt(e.target.value) }
                        }))}
                        className="w-full"
                      />
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 text-center">
                    Total posts per page: {settings.gridLayout.columns * settings.gridLayout.rows}
                  </div>
                </div>
              )}
            </div>

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
          </section>

          {/* Upload Settings */}
          <section className="settings-card">
            <h2 className="text-2xl font-[family-name:var(--font-geist-mono)] mb-4 text-black dark:text-gray-400">
              Upload Settings
            </h2>

            <div className="space-y-4">
              <div className="settings-row">
                <span className="font-[family-name:var(--font-geist-mono)] text-gray-900 dark:text-gray-400">
                  Default Privacy
                </span>
                <select
                  value={settings.uploadSettings.defaultPrivacy}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    uploadSettings: {
                      ...prev.uploadSettings,
                      defaultPrivacy: e.target.value as typeof settings.uploadSettings.defaultPrivacy
                    }
                  }))}
                  className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50"
                >
                  <option value="public">Public</option>
                  <option value="unlisted">Unlisted</option>
                  <option value="private">Private</option>
                </select>
              </div>

              <div className="settings-row">
                <span className="font-[family-name:var(--font-geist-mono)] text-gray-900 dark:text-gray-400">
                  Default Content Rating
                </span>
                <select
                  value={settings.uploadSettings.defaultContentRating}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    uploadSettings: {
                      ...prev.uploadSettings,
                      defaultContentRating: e.target.value as typeof settings.uploadSettings.defaultContentRating
                    }
                  }))}
                  className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50"
                >
                  <option value="safe">Safe</option>
                  <option value="sketchy">Sketchy</option>
                  <option value="unsafe">Unsafe</option>
                </select>
              </div>
            </div>
          </section>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
