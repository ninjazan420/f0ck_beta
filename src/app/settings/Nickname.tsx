import { useState } from 'react';
import { useSession } from 'next-auth/react';

interface NicknameProps {
  settings: any;
  setSettings: (settings: any) => void;
  hasPremiumAccess: boolean;
}

// Verbesserte und erweiterte Styles
const nicknameStyles = {
  solid: [
    { label: 'Purple', value: 'purple-500', preview: 'text-purple-500' },
    { label: 'Pink', value: 'pink-500', preview: 'text-pink-500' },
    { label: 'Blue', value: 'blue-500', preview: 'text-blue-500' },
    { label: 'Emerald', value: 'emerald-500', preview: 'text-emerald-500' },
    { label: 'Teal', value: 'teal-500', preview: 'text-teal-500' },
    { label: 'Rose', value: 'rose-500', preview: 'text-rose-500' },
    { label: 'Violet', value: 'violet-500', preview: 'text-violet-500' },
    { label: 'Indigo', value: 'indigo-500', preview: 'text-indigo-500' },
    { label: 'Cyan', value: 'cyan-500', preview: 'text-cyan-500' },
    { label: 'Sky', value: 'sky-500', preview: 'text-sky-500' },
    { label: 'Orange', value: 'orange-500', preview: 'text-orange-500' },
    { label: 'Yellow', value: 'yellow-500', preview: 'text-yellow-500' }
  ],
  gradient: [
    { 
      label: 'Purple to Pink', 
      value: ['purple-400', 'pink-600'],
      preview: 'bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent'
    },
    { 
      label: 'Blue to Purple',
      value: ['blue-400', 'purple-600'],
      preview: 'bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent'
    },
    { 
      label: 'Cyan to Blue',
      value: ['cyan-400', 'blue-600'],
      preview: 'bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent'
    },
    { 
      label: 'Teal to Cyan',
      value: ['teal-400', 'cyan-600'],
      preview: 'bg-gradient-to-r from-teal-400 to-cyan-600 bg-clip-text text-transparent'
    },
    { 
      label: 'Rose to Purple',
      value: ['rose-400', 'purple-600'],
      preview: 'bg-gradient-to-r from-rose-400 to-purple-600 bg-clip-text text-transparent'
    },
    { 
      label: 'Amber to Rose',
      value: ['amber-400', 'rose-600'],
      preview: 'bg-gradient-to-r from-amber-400 to-rose-600 bg-clip-text text-transparent'
    },
    { 
      label: 'Emerald to Blue',
      value: ['emerald-400', 'blue-600'],
      preview: 'bg-gradient-to-r from-emerald-400 to-blue-600 bg-clip-text text-transparent'
    },
    { 
      label: 'Indigo to Cyan',
      value: ['indigo-400', 'cyan-600'],
      preview: 'bg-gradient-to-r from-indigo-400 to-cyan-600 bg-clip-text text-transparent'
    }
  ],
  animated: [
    {
      label: 'Pulse',
      value: 'pulse',
      preview: 'animate-pulse bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent'
    },
    {
      label: 'Sparkle',
      value: 'sparkle',
      preview: 'animate-sparkle bg-gradient-to-r from-indigo-400 via-pink-500 to-purple-500 bg-size-200 bg-clip-text text-transparent'
    },
    {
      label: 'Rainbow',
      value: 'rainbow',
      preview: 'animate-rainbow bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 bg-size-200 bg-clip-text text-transparent'
    },
    {
      label: 'Shine',
      value: 'shine',
      preview: 'animate-shine bg-gradient-to-r from-purple-400 via-white to-purple-400 bg-size-200 bg-clip-text text-transparent'
    }
  ]
};

export function Nickname({ settings, setSettings, hasPremiumAccess }: NicknameProps) {
  const { data: session } = useSession();
  const username = session?.user?.name || 'Username';
  const [previewNickname, setPreviewNickname] = useState('Your Nickname');

  const getStylePreview = (style: any) => {
    if (Array.isArray(style.value)) {
      return `bg-gradient-to-r from-${style.value[0]} to-${style.value[1]} bg-clip-text text-transparent`;
    }
    if (style.preview) {
      return `animate-${style.value} ${style.preview} bg-clip-text text-transparent`;
    }
    return `text-${style.value}`;
  };

  const getPreviewStyle = (currentStyle: any) => {
    const styleType = settings.premium.nickname.style.type;
    if (styleType === 'solid') {
      return `text-${settings.premium.nickname.style.color}`;
    }
    if (styleType === 'gradient') {
      const [from, to] = settings.premium.nickname.style.gradient || ['purple-400', 'pink-600'];
      return `bg-gradient-to-r from-${from} to-${to} bg-clip-text text-transparent`;
    }
    if (styleType === 'animated') {
      const style = nicknameStyles.animated.find(s => s.value === settings.premium.nickname.style.animation);
      return style?.preview || nicknameStyles.animated[0].preview;
    }
    return '';
  };

  return (
    <div className="space-y-4">
      {/* Preview Box für Nicht-Premium User */}
      {!hasPremiumAccess && (
        <div className="relative p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm overflow-hidden">
          <div className="absolute inset-0 bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-[2px] flex items-center justify-center z-10">
            <div className="text-center space-y-3">
              <span className="px-4 py-2 bg-purple-600/10 rounded-full text-sm text-purple-600 dark:text-purple-400 font-medium">
                Custom nickname styling available with Premium 💎
              </span>
              <a 
                href="/premium" 
                className="block px-4 py-2 text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
              >
                Upgrade now
              </a>
            </div>
          </div>
          
          <div className="space-y-6">
            {/* Preview mit Standard-Style */}
            <div className="p-4 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
              <div className="text-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">Preview</span>
                <div className="h-16 flex items-center justify-center">
                  <span className="text-2xl font-medium bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                    {username}
                  </span>
                </div>
              </div>
            </div>

            {/* Beispiel-Styles (deaktiviert) */}
            <div className="space-y-4 opacity-75">
              <div className="flex gap-2 justify-center">
                {['solid', 'gradient', 'animated'].map((type) => (
                  <button
                    key={type}
                    disabled
                    className="px-3 py-1.5 text-sm rounded-lg bg-gray-50 dark:bg-gray-800/50 text-gray-400"
                  >
                    <span className="capitalize">{type}</span>
                  </button>
                ))}
              </div>
              
              <div className="grid grid-cols-6 gap-1.5">
                {nicknameStyles.solid.slice(0, 6).map((style) => (
                  <button
                    key={style.value}
                    disabled
                    className="p-2 rounded-lg border-2 border-transparent text-center"
                  >
                    <span className={style.preview}>
                      {style.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Premium User Interface */}
      {hasPremiumAccess && (
        <>
          {/* Toggle Header */}
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
                onChange={() => setSettings(prev => ({
                  ...prev,
                  premium: {
                    ...prev.premium,
                    nickname: {
                      ...prev.premium.nickname,
                      enabled: !prev.premium.nickname.enabled
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

          {/* Style Options */}
          {settings.premium.nickname.enabled && (
            <div className="relative p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
              {!hasPremiumAccess && (
                <div className="absolute inset-0 bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-[2px] rounded-lg flex items-center justify-center z-10">
                  <div className="text-center">
                    <span className="px-4 py-2 bg-purple-600/10 rounded-full text-sm text-purple-600 dark:text-purple-400 font-medium">
                      Custom nickname styling available with Premium 💎
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {/* Preview Section */}
                <div className="p-4 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
                  <div className="text-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Preview</span>
                    <div className="h-16 flex items-center justify-center">
                      <span className={`text-2xl font-medium ${getPreviewStyle(settings.premium.nickname.style)}`}>
                        {username}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Style Options */}
                <div className="space-y-4">
                  {/* Style Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Style Type
                    </label>
                    <div className="flex gap-2 justify-center">
                      {['solid', 'gradient', 'animated'].map((type) => (
                        <button
                          key={type}
                          onClick={() => setSettings(prev => ({
                            ...prev,
                            premium: {
                              ...prev.premium,
                              nickname: {
                                ...prev.premium.nickname,
                                style: {
                                  ...prev.premium.nickname.style,
                                  type
                                }
                              }
                            }
                          }))}
                          className={`px-3 py-1.5 text-sm rounded-lg transition-all
                            ${settings.premium.nickname.style.type === type 
                              ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' 
                              : 'bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400'}
                            ${hasPremiumAccess ? 'hover:bg-purple-50 dark:hover:bg-purple-900/20' : 'cursor-not-allowed opacity-50'}
                          `}
                          disabled={!hasPremiumAccess}
                        >
                          <span className="capitalize">{type}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color/Effect Options */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {settings.premium.nickname.style.type === 'animated' ? 'Effects' : 'Colors'}
                    </label>
                    <div className={`grid ${settings.premium.nickname.style.type === 'gradient' ? 'grid-cols-4' : 'grid-cols-6'} gap-1.5`}>
                      {(settings.premium.nickname.style.type === 'animated'
                        ? nicknameStyles.animated
                        : settings.premium.nickname.style.type === 'gradient'
                        ? nicknameStyles.gradient
                        : nicknameStyles.solid
                      ).map((style: any) => (
                        <button
                          key={typeof style.value === 'string' ? style.value : style.value.join('-')}
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
                                    : settings.premium.nickname.style.type === 'animated'
                                    ? { animation: style.value }
                                    : { color: style.value }
                                  )
                                }
                              }
                            }
                          }))}
                          className={`p-2 rounded-lg border-2 transition-all text-center
                            ${(
                              Array.isArray(style.value)
                                ? settings.premium.nickname.style.gradient?.join('-') === style.value.join('-')
                                : settings.premium.nickname.style.type === 'animated'
                                ? settings.premium.nickname.style.animation === style.value
                                : settings.premium.nickname.style.color === style.value
                            ) ? 'border-purple-500' : 'border-transparent'}
                            ${hasPremiumAccess ? 'hover:bg-gray-50 dark:hover:bg-gray-800/50' : 'cursor-not-allowed'}
                          `}
                          disabled={!hasPremiumAccess}
                        >
                          <span className={style.preview}>
                            {style.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
