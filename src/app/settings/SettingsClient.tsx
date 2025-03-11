'use client';
import { Footer } from "@/components/Footer";
import { useTheme } from "@/context/ThemeContext";
import { RandomLogo } from "@/components/RandomLogo";
import { useState, ChangeEvent } from 'react';
import { SettingsPremium } from './SettingsPremium';

interface SettingsClientProps {
  userRole: 'user' | 'premium' | 'moderator' | 'admin' | 'banned';
}

export default function SettingsClient({ userRole = 'user' }: SettingsClientProps) {
  const { theme, toggleTheme } = useTheme();
  const [settings, setSettings] = useState({
    blurNsfw: true, // Default-Wert auf true gesetzt
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
      },
      nickname: {
        enabled: false,
        style: {
          type: 'solid' as 'solid' | 'gradient' | 'animated',
          color: 'purple-600',
          gradient: ['purple-400', 'pink-600'],
          animate: false,
          animation: 'pulse' // Neue Eigenschaft hinzugefügt
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
                  checked={theme === "dark"}
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
                  onChange={handleSettingChange("blurNsfw")}
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
                  onChange={handleSettingChange("showEmail")}
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
                  onChange={handleSettingChange("allowDm")}
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
                  onChange={handleSettingChange("autoplayGifs")}
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
                  onChange={handleSettingChange("highQualityThumbs")}
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
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      autoplayVideos: e.target.checked,
                    }))
                  }
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
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      muteAutoplay: e.target.checked,
                    }))
                  }
                />
                <div className="toggle-switch-background">
                  <div className="toggle-switch-handle"></div>
                </div>
              </label>
            </div>
          </section>

          {/* Layout Settings */}
          <section className="settings-card">
            <h2 className="text-2xl font-[family-name:var(--font-geist-mono)] mb-4 text-black dark:text-gray-400">
              Layout Preferences
            </h2>

            <div className="space-y-4">
              {/* Custom Grid Layout Toggle */}
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
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        gridLayout: {
                          ...prev.gridLayout,
                          customLayout: e.target.checked,
                        },
                      }))
                    }
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
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            gridLayout: {
                              ...prev.gridLayout,
                              columns: parseInt(e.target.value),
                            },
                          }))
                        }
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
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            gridLayout: {
                              ...prev.gridLayout,
                              rows: parseInt(e.target.value),
                            },
                          }))
                        }
                        className="w-full"
                      />
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 text-center">
                    Total posts per page:{" "}
                    {settings.gridLayout.columns * settings.gridLayout.rows}
                  </div>
                </div>
              )}
            </div>

            {/* Grid Layout Size Selector */}
            <div className="settings-row">
              <span className="font-[family-name:var(--font-geist-mono)] text-gray-900 dark:text-gray-400">
                Grid Layout
              </span>
              <select
                value={settings.gridSize}
                onChange={(e) => {
                  const newSize = e.target.value as typeof settings.gridSize;
                  const columns = {
                    "28": "7",
                    "42": "7",
                    "63": "9",
                    "88": "11",
                  }[newSize] as typeof settings.gridColumns;

                  setSettings((prev) => ({
                    ...prev,
                    gridSize: newSize,
                    gridColumns: columns,
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
                  Default Content Rating
                </span>
                <select
                  value={settings.uploadSettings.defaultContentRating}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      uploadSettings: {
                        ...prev.uploadSettings,
                        defaultContentRating: e.target
                          .value as typeof settings.uploadSettings.defaultContentRating,
                      },
                    }))
                  }
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
