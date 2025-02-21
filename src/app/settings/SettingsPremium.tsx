import { ChangeEvent } from 'react';

interface PremiumProps {
  settings: any;
  setSettings: (settings: any) => void;
  userRole?: 'user' | 'premium' | 'moderator' | 'admin' | 'banned';
}

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

export function SettingsPremium({ settings, setSettings, userRole = 'user' }: PremiumProps) {
  const hasPremiumAccess = userRole === 'premium' || userRole === 'moderator' || userRole === 'admin';

  return (
    <section className="settings-card bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-[family-name:var(--font-geist-mono)] text-black dark:text-gray-400">
          Premium Features 💎
        </h2>
        {!hasPremiumAccess && (
          <a href="/premium" className="px-3 py-1.5 text-sm rounded-lg bg-purple-600 hover:bg-purple-700 text-white">
            Upgrade
          </a>
        )}
      </div>

      <div className="space-y-4">
        {/* GIF Upload Size */}
        <div className="settings-row">
          <div className="flex flex-col">
            <span className="font-[family-name:var(--font-geist-mono)] text-gray-900 dark:text-gray-400">
              GIF Upload Size
            </span>
            <span className="text-xs text-gray-500">
              {hasPremiumAccess ? "Up to 50MB" : "Up to 10MB (50MB with premium)"}
            </span>
          </div>
          <label className={`toggle-switch ${!hasPremiumAccess && "opacity-50 cursor-not-allowed"}`}>
            <input
              type="checkbox"
              checked={settings.premium.maxGifSize}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                premium: { ...prev.premium, maxGifSize: e.target.checked }
              }))}
              disabled={!hasPremiumAccess}
            />
            <div className="toggle-switch-background">
              <div className="toggle-switch-handle"></div>
            </div>
          </label>
        </div>

        {/* Original Video Quality */}
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
          <label className={`toggle-switch ${!hasPremiumAccess && "opacity-50 cursor-not-allowed"}`}>
            <input
              type="checkbox"
              checked={settings.premium.keepOriginalVideoQuality}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                premium: { ...prev.premium, keepOriginalVideoQuality: e.target.checked }
              }))}
              disabled={!hasPremiumAccess}
            />
            <div className="toggle-switch-background">
              <div className="toggle-switch-handle"></div>
            </div>
          </label>
        </div>

        {/* Hide Advertisements */}
        <div className="settings-row">
          <div className="flex flex-col">
            <span className="font-[family-name:var(--font-geist-mono)] text-gray-900 dark:text-gray-400">
              Hide Advertisements
            </span>
            <span className="text-xs text-gray-500">
              Remove all ads from the site
            </span>
          </div>
          <label className={`toggle-switch ${!hasPremiumAccess && "opacity-50 cursor-not-allowed"}`}>
            <input
              type="checkbox"
              checked={settings.premium.hideAds}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                premium: { ...prev.premium, hideAds: e.target.checked }
              }))}
              disabled={!hasPremiumAccess}
            />
            <div className="toggle-switch-background">
              <div className="toggle-switch-handle"></div>
            </div>
          </label>
        </div>

        {/* Custom Pools */}
        <div className="settings-row">
          <div className="flex flex-col">
            <span className="font-[family-name:var(--font-geist-mono)] text-gray-900 dark:text-gray-400">
              Custom Pools (Albums)
            </span>
            <span className="text-xs text-gray-500">
              Create unlimited public & private pools
            </span>
          </div>
          <label className={`toggle-switch ${!hasPremiumAccess && "opacity-50 cursor-not-allowed"}`}>
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
              disabled={!hasPremiumAccess}
            />
            <div className="toggle-switch-background">
              <div className="toggle-switch-handle"></div>
            </div>
          </label>
        </div>

        {/* Advanced Tag Features */}
        <div className="settings-row">
          <div className="flex flex-col">
            <span className="font-[family-name:var(--font-geist-mono)] text-gray-900 dark:text-gray-400">
              Advanced Tag Features
            </span>
            <span className="text-xs text-gray-500">
              Unlimited tag favorites & custom categories
            </span>
          </div>
          <label className={`toggle-switch ${!hasPremiumAccess && "opacity-50 cursor-not-allowed"}`}>
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
              disabled={!hasPremiumAccess}
            />
            <div className="toggle-switch-background">
              <div className="toggle-switch-handle"></div>
            </div>
          </label>
        </div>

        {/* Enhanced Notifications */}
        <div className="settings-row">
          <div className="flex flex-col">
            <span className="font-[family-name:var(--font-geist-mono)] text-gray-900 dark:text-gray-400">
              Enhanced Notifications
            </span>
            <span className="text-xs text-gray-500">
              Custom filters & advanced alerts
            </span>
          </div>
          <label className={`toggle-switch ${!hasPremiumAccess && "opacity-50 cursor-not-allowed"}`}>
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
              disabled={!hasPremiumAccess}
            />
            <div className="toggle-switch-background">
              <div className="toggle-switch-handle"></div>
            </div>
          </label>
        </div>

        {/* Private Messaging */}
        <div className="settings-row">
          <div className="flex flex-col">
            <span className="font-[family-name:var(--font-geist-mono)] text-gray-900 dark:text-gray-400">
              Private Messaging
            </span>
            <span className="text-xs text-gray-500">
              Unlimited conversations & attachments
            </span>
          </div>
          <label className={`toggle-switch ${!hasPremiumAccess && "opacity-50 cursor-not-allowed"}`}>
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
              disabled={!hasPremiumAccess}
            />
            <div className="toggle-switch-background">
              <div className="toggle-switch-handle"></div>
            </div>
          </label>
        </div>

        {/* Nickname Styling */}
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
            <label className={`toggle-switch ${!hasPremiumAccess && "opacity-50 cursor-not-allowed"}`}>
              <input
                type="checkbox"
                checked={settings.premium.nickname.enabled}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  premium: {
                    ...prev.premium,
                    nickname: {
                      ...prev.premium.nickname,
                      enabled: e.target.checked
                    }
                  }
                }))}
                disabled={!hasPremiumAccess}
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
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    premium: {
                      ...prev.premium,
                      nickname: {
                        ...prev.premium.nickname,
                        style: {
                          ...prev.premium.nickname.style,
                          type: e.target.value as typeof settings.premium.nickname.style.type
                        }
                      }
                    }
                  }))}
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
                      onClick={() => setSettings(prev => ({
                        ...prev,
                        premium: {
                          ...prev.premium,
                          nickname: {
                            ...prev.premium.nickname,
                            style: {
                              ...prev.premium.nickname.style,
                              color: color.value
                            }
                          }
                        }
                      }))}
                      className={`p-2 rounded-lg border-2 ${
                        settings.premium.nickname.style.color === color.value
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
                  {(settings.premium.nickname.style.type === "gradient" ? nicknameStyles.gradient : nicknameStyles.animated).map((style) => (
                    <button
                      key={typeof style.value === "string" ? style.value : style.value.join("-")}
                      onClick={() => setSettings(prev => ({
                        ...prev,
                        premium: {
                          ...prev.premium,
                          nickname: {
                            ...prev.premium.nickname,
                            style: {
                              ...prev.premium.nickname.style,
                              ...(Array.isArray(style.value) 
                                ? { gradient: style.value }
                                : { animation: style.value }
                              )
                            }
                          }
                        }
                      }))}
                      className={`p-2 rounded-lg border-2 ${
                        Array.isArray(style.value)
                          ? settings.premium.nickname.style.gradient?.join("-") === style.value.join("-")
                            ? "border-purple-500"
                            : "border-transparent"
                          : settings.premium.nickname.style.animation === style.value
                            ? "border-purple-500"
                            : "border-transparent"
                      }`}
                    >
                      <span className={
                        settings.premium.nickname.style.type === "gradient"
                          ? `bg-gradient-to-r from-${style.value[0]} to-${style.value[1]} bg-clip-text text-transparent`
                          : `animate-${style.value} bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent`
                      }>
                        {style.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Preview */}
              <div className="mt-4 p-4 rounded-lg bg-white dark:bg-gray-900 text-center">
                <span className={`text-lg font-medium ${
                  settings.premium.nickname.style.type === "solid"
                    ? `text-${settings.premium.nickname.style.color}`
                    : `${
                        settings.premium.nickname.style.type === "animated"
                          ? `animate-${settings.premium.nickname.style.animation}`
                          : ""
                      } bg-gradient-to-r from-${settings.premium.nickname.style.gradient?.[0]} to-${
                        settings.premium.nickname.style.gradient?.[1]
                      } bg-clip-text text-transparent`
                }`}>
                  Your Nickname
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Nickname Style Preview (für alle sichtbar) */}
        <div className="relative space-y-4 p-6 bg-gray-100/50 dark:bg-gray-800/50 rounded-lg backdrop-blur-sm">
          {/* Premium Overlay */}
          {!hasPremiumAccess && (
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
                  disabled={!hasPremiumAccess}
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
                  {settings.premium.nickname.style.type === "animated" ? "Effect" : "Color Style"}
                </label>
                <div className={`grid ${settings.premium.nickname.style.type === "gradient" ? "grid-cols-2" : "grid-cols-3"} gap-2`}>
                  {(settings.premium.nickname.style.type === "animated"
                    ? nicknameStyles.animated
                    : settings.premium.nickname.style.type === "gradient"
                    ? nicknameStyles.gradient
                    : nicknameStyles.solid
                  ).map((style) => (
                    <button
                      key={typeof style.value === "string" ? style.value : style.value.join("-")}
                      className={`p-2 rounded-lg border-2 transition-all
                        ${hasPremiumAccess ? "hover:bg-gray-50 dark:hover:bg-gray-800/50" : "cursor-not-allowed"}
                        ${settings.premium.nickname.style.color === style.value ? "border-purple-500" : "border-transparent"}
                      `}
                      disabled={!hasPremiumAccess}
                    >
                      <span className={
                        settings.premium.nickname.style.type === "gradient"
                          ? `bg-gradient-to-r from-${style.value[0]} to-${style.value[1]} bg-clip-text text-transparent`
                          : settings.premium.nickname.style.type === "animated"
                          ? `animate-${style.value} bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent`
                          : `text-${style.value}`
                      }>
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
              <span className={`text-lg font-medium ${
                settings.premium.nickname.style.type === "animated"
                  ? `animate-${settings.premium.nickname.style.animation} bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent`
                  : settings.premium.nickname.style.type === "gradient"
                  ? `bg-gradient-to-r from-${settings.premium.nickname.style.gradient?.[0]} to-${settings.premium.nickname.style.gradient?.[1]} bg-clip-text text-transparent`
                  : `text-${settings.premium.nickname.style.color}`
              }`}>
                Your Nickname
              </span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
