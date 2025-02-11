'use client';
import { Footer } from "@/components/Footer";
import { useTheme } from "@/context/ThemeContext";
import { RandomLogo } from "@/components/RandomLogo";
import { useState, ChangeEvent } from 'react';

export default function SettingsClient() {
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

  const nicknameStyles = {
    solid: [
      { label: 'Purple', value: 'purple-600' },
      { label: 'Pink', value: 'pink-600' },
      { label: 'Blue', value: 'blue-600' },
      { label: 'Emerald', value: 'emerald-500' },
      { label: 'Rose', value: 'rose-500' },
      { label: 'Violet', value: 'violet-500' }
    ],
    gradient: [
      { label: 'Purple to Pink', value: ['purple-400', 'pink-600'] },
      { label: 'Blue to Purple', value: ['blue-400', 'purple-600'] },
      { label: 'Rose to Purple', value: ['rose-400', 'purple-600'] },
      { label: 'Emerald to Blue', value: ['emerald-400', 'blue-600'] }
    ],
    animated: [
      { label: 'Pulse', value: 'pulse' },
      { label: 'Sparkle', value: 'sparkle' },
      { label: 'Rainbow', value: 'rainbow' }
    ]
  };

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
          Settings
        </h1>

        <div className="space-y-6">
          {/* Premium Features Section */}
          <section className="settings-card bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-[family-name:var(--font-geist-mono)] text-black dark:text-gray-400">
                Premium Features 💎
              </h2>
              {!settings.premium.isActive && (
                <a
                  href="/premium"
                  className="px-3 py-1.5 text-sm rounded-lg bg-purple-600 hover:bg-purple-700 text-white"
                >
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
                    {settings.premium.maxGifSize
                      ? "Up to 50MB"
                      : "Up to 10MB (50MB with premium)"}
                  </span>
                </div>
                <label
                  className={`toggle-switch ${
                    !settings.premium.isActive &&
                    "opacity-50 cursor-not-allowed"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={settings.premium.maxGifSize}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        premium: {
                          ...prev.premium,
                          maxGifSize: e.target.checked,
                        },
                      }))
                    }
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
                    {settings.premium.keepOriginalVideoQuality
                      ? "Keep original resolution"
                      : "Rendered down to 720p | Premium keep original resolution"}
                  </span>
                </div>
                <label
                  className={`toggle-switch ${
                    !settings.premium.isActive &&
                    "opacity-50 cursor-not-allowed"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={settings.premium.keepOriginalVideoQuality}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        premium: {
                          ...prev.premium,
                          keepOriginalVideoQuality: e.target.checked,
                        },
                      }))
                    }
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
                  <span className="text-xs text-gray-500">
                    Remove all ads from the site
                  </span>
                </div>
                <label
                  className={`toggle-switch ${
                    !settings.premium.isActive &&
                    "opacity-50 cursor-not-allowed"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={settings.premium.hideAds}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        premium: { ...prev.premium, hideAds: e.target.checked },
                      }))
                    }
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
                <label
                  className={`toggle-switch ${
                    !settings.premium.isActive &&
                    "opacity-50 cursor-not-allowed"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={settings.premium.pools.enabled}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        premium: {
                          ...prev.premium,
                          pools: {
                            ...prev.premium.pools,
                            enabled: e.target.checked,
                            privatePools: e.target.checked,
                          },
                        },
                      }))
                    }
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
                <label
                  className={`toggle-switch ${
                    !settings.premium.isActive &&
                    "opacity-50 cursor-not-allowed"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={settings.premium.tags.favorites}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        premium: {
                          ...prev.premium,
                          tags: {
                            ...prev.premium.tags,
                            favorites: e.target.checked,
                            customCategories: e.target.checked,
                          },
                        },
                      }))
                    }
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
                <label
                  className={`toggle-switch ${
                    !settings.premium.isActive &&
                    "opacity-50 cursor-not-allowed"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={settings.premium.notifications.customFilters}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        premium: {
                          ...prev.premium,
                          notifications: {
                            ...prev.premium.notifications,
                            customFilters: e.target.checked,
                            mentionAlerts: e.target.checked,
                            tagUpdates: e.target.checked,
                            poolUpdates: e.target.checked,
                          },
                        },
                      }))
                    }
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
                <label
                  className={`toggle-switch ${
                    !settings.premium.isActive &&
                    "opacity-50 cursor-not-allowed"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={settings.premium.messaging.enabled}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        premium: {
                          ...prev.premium,
                          messaging: {
                            ...prev.premium.messaging,
                            enabled: e.target.checked,
                            attachments: e.target.checked,
                            groupChats: e.target.checked,
                          },
                        },
                      }))
                    }
                    disabled={!settings.premium.isActive}
                  />
                  <div className="toggle-switch-background">
                    <div className="toggle-switch-handle"></div>
                  </div>
                </label>
              </div>

              <div className="space-y-4">
                <div className="settings-row">
                  <div className="flex flex-col">
                    <span className="font-[family-name:var(--font-geist-mono)] inline-flex items-center gap-1">
                      <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent font-semibold">
                        Colored Nickname and Avatar
                      </span>
                      <span className="text-yellow-500 animate-pulse">⭐</span>
                    </span>
                    <span className="text-xs text-gray-500">
                      Customize your nickname appearance
                    </span>
                  </div>
                  <label
                    className={`toggle-switch ${
                      !settings.premium.isActive &&
                      "opacity-50 cursor-not-allowed"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={settings.premium.nickname.enabled}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          premium: {
                            ...prev.premium,
                            nickname: {
                              ...prev.premium.nickname,
                              enabled: e.target.checked,
                            },
                          },
                        }))
                      }
                      disabled={!settings.premium.isActive}
                    />
                    <div className="toggle-switch-background">
                      <div className="toggle-switch-handle"></div>
                    </div>
                  </label>
                </div>

                {settings.premium.nickname.enabled && (
                  <div className="space-y-4 p-4 bg-gray-100/50 dark:bg-gray-800/50 rounded-lg">
                    <div className="space-y-2">
                      <label className="block text-sm text-gray-600 dark:text-gray-400">
                        Style Type
                      </label>
                      <select
                        value={settings.premium.nickname.style.type}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            premium: {
                              ...prev.premium,
                              nickname: {
                                ...prev.premium.nickname,
                                style: {
                                  ...prev.premium.nickname.style,
                                  type: e.target
                                    .value as typeof settings.premium.nickname.style.type,
                                },
                              },
                            },
                          }))
                        }
                        className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50"
                      >
                        <option value="solid">Solid Color</option>
                        <option value="gradient">Gradient</option>
                        <option value="animated">Animated</option>
                      </select>
                    </div>

                    {settings.premium.nickname.style.type === "solid" ? (
                      <div className="grid grid-cols-3 gap-2">
                        {nicknameStyles.solid.map((color) => (
                          <button
                            key={color.value}
                            onClick={() =>
                              setSettings((prev) => ({
                                ...prev,
                                premium: {
                                  ...prev.premium,
                                  nickname: {
                                    ...prev.premium.nickname,
                                    style: {
                                      ...prev.premium.nickname.style,
                                      color: color.value,
                                    },
                                  },
                                },
                              }))
                            }
                            className={`p-2 rounded-lg border-2 ${
                              settings.premium.nickname.style.color ===
                              color.value
                                ? "border-purple-500"
                                : "border-transparent"
                            }`}
                          >
                            <span className={`text-${color.value}`}>
                              {color.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {nicknameStyles.gradient.map((gradient) => (
                          <button
                            key={gradient.value.join("-")}
                            onClick={() =>
                              setSettings((prev) => ({
                                ...prev,
                                premium: {
                                  ...prev.premium,
                                  nickname: {
                                    ...prev.premium.nickname,
                                    style: {
                                      ...prev.premium.nickname.style,
                                      gradient: gradient.value,
                                    },
                                  },
                                },
                              }))
                            }
                            className={`p-2 rounded-lg border-2 ${
                              settings.premium.nickname.style.gradient?.join(
                                "-"
                              ) === gradient.value.join("-")
                                ? "border-purple-500"
                                : "border-transparent"
                            }`}
                          >
                            <span
                              className={`bg-gradient-to-r from-${gradient.value[0]} to-${gradient.value[1]} bg-clip-text text-transparent`}
                            >
                              {gradient.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Preview */}
                    <div className="mt-4 p-4 rounded-lg bg-white dark:bg-gray-900 text-center">
                      <span
                        className={`text-lg font-medium ${
                          settings.premium.nickname.style.type === "solid"
                            ? `text-${settings.premium.nickname.style.color}`
                            : `${
                                settings.premium.nickname.style.type ===
                                "animated"
                                  ? "animate-pulse"
                                  : ""
                              } bg-gradient-to-r from-${
                                settings.premium.nickname.style.gradient?.[0]
                              } to-${
                                settings.premium.nickname.style.gradient?.[1]
                              } bg-clip-text text-transparent`
                        }`}
                      >
                        Your Nickname
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Nickname Style Preview (für alle sichtbar) */}
          <div className="relative space-y-4 p-6 bg-gray-100/50 dark:bg-gray-800/50 rounded-lg backdrop-blur-sm">
            {/* Premium Overlay */}
            {!settings.premium.isActive && (
              <div className="absolute inset-0 bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-[2px] rounded-lg flex items-center justify-center z-10">
                <div className="text-center">
                  <span className="px-4 py-2 bg-purple-600/10 rounded-full text-sm text-purple-600 dark:text-purple-400 font-medium">
                    Custom nickname styling available with Premium 💎
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              {/* Style Options */}
              <div className="flex-1 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Style Type
                  </label>
                  <select
                    value={settings.premium.nickname.style.type}
                    disabled={!settings.premium.isActive}
                    className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50"
                  >
                    <option value="solid">Solid Color</option>
                    <option value="gradient">Gradient</option>
                    <option value="animated">Animated Effects</option>
                  </select>
                </div>

                {/* Color/Effect Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {settings.premium.nickname.style.type === "animated"
                      ? "Effect"
                      : "Color Style"}
                  </label>
                  <div
                    className={`grid ${
                      settings.premium.nickname.style.type === "gradient"
                        ? "grid-cols-2"
                        : "grid-cols-3"
                    } gap-2`}
                  >
                    {(settings.premium.nickname.style.type === "animated"
                      ? nicknameStyles.animated
                      : settings.premium.nickname.style.type === "gradient"
                      ? nicknameStyles.gradient
                      : nicknameStyles.solid
                    ).map((style) => (
                      <button
                        key={
                          typeof style.value === "string"
                            ? style.value
                            : style.value.join("-")
                        }
                        className={`p-2 rounded-lg border-2 transition-all
                          ${
                            settings.premium.isActive
                              ? "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                              : "cursor-not-allowed"
                          }
                          ${
                            settings.premium.nickname.style.color ===
                            style.value
                              ? "border-purple-500"
                              : "border-transparent"
                          }
                        `}
                        disabled={!settings.premium.isActive}
                      >
                        <span
                          className={
                            settings.premium.nickname.style.type === "gradient"
                              ? `bg-gradient-to-r from-${style.value[0]} to-${style.value[1]} bg-clip-text text-transparent`
                              : settings.premium.nickname.style.type ===
                                "animated"
                              ? `animate-${style.value} bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent`
                              : `text-${style.value}`
                          }
                        >
                          {style.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="w-1/3 p-4 rounded-lg bg-white dark:bg-gray-900/50 flex flex-col items-center justify-center">
                <span className="text-sm text-gray-500 mb-2">Preview</span>
                <span
                  className={`text-lg font-medium ${
                    settings.premium.nickname.style.type === "animated"
                      ? `animate-${settings.premium.nickname.style.animation} bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent`
                      : settings.premium.nickname.style.type === "gradient"
                      ? `bg-gradient-to-r from-${settings.premium.nickname.style.gradient?.[0]} to-${settings.premium.nickname.style.gradient?.[1]} bg-clip-text text-transparent`
                      : `text-${settings.premium.nickname.style.color}`
                  }`}
                >
                  Your Nickname
                </span>
              </div>
            </div>
          </div>

          {/* Appearance Settings Section */}
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

          {/* Account Settings Section */}
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

          {/* Content Preferences Section */}
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

          {/* Layout Settings Section */}
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

          {/* Upload Settings Section */}
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
