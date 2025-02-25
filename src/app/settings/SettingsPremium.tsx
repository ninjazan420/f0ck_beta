import { Nickname } from './Nickname';  // Removed unused ChangeEvent import

// Define a proper type for settings
interface PremiumSettings {
  premium: {
    maxGifSize: boolean;
    keepOriginalVideoQuality: boolean;
    hideAds: boolean;
    pools: {
      enabled: boolean;
      privatePools: boolean;
    };
    tags: {
      favorites: boolean;
      customCategories: boolean;
    };
    notifications: {
      customFilters: boolean;
      mentionAlerts: boolean;
      tagUpdates: boolean;
      poolUpdates: boolean;
    };
    messaging: {
      enabled: boolean;
      attachments: boolean;
      groupChats: boolean;
    };
  };
}

interface PremiumProps {
  settings: PremiumSettings;
  setSettings: (settings: PremiumSettings) => void;
  userRole: 'user' | 'premium' | 'moderator' | 'admin' | 'banned';
}

export function SettingsPremium({ settings, setSettings, userRole }: PremiumProps) {
  const hasPremiumAccess = ['premium', 'moderator', 'admin'].includes(userRole);
  
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
          {/* Entferne die Bedingung aus der className, da sie möglicherweise Probleme verursacht */}
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.premium.maxGifSize}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                premium: { ...prev.premium, maxGifSize: e.target.checked }
              }))}
              disabled={!hasPremiumAccess}
            />
            <div className={`toggle-switch-background ${!hasPremiumAccess ? 'opacity-50' : ''}`}>
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

        {/* Nickname Styling - Vereinfacht */}
        <Nickname 
          settings={settings} 
          setSettings={setSettings} 
          hasPremiumAccess={hasPremiumAccess}
        />

      </div>
    </section>
  );
}
