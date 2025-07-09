'use client';

interface PrivacySettingsData {
  isProfilePrivate: boolean;
  showBio: boolean;
  showComments: boolean;
  showLikes: boolean;
  showDislikes: boolean;
  showFavorites: boolean;
  showUploads: boolean;
}

interface PrivacySettingsProps {
  privacySettings: PrivacySettingsData;
  togglePrivacySetting: (setting: keyof PrivacySettingsData) => void;
}

export function PrivacySettings({
  privacySettings,
  togglePrivacySetting
}: PrivacySettingsProps) {
  return (
    <div className="p-6 rounded-xl bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-[family-name:var(--font-geist-mono)] text-gray-800 dark:text-gray-400">
          Privacy Settings (does not change anything yet)
        </h3>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={privacySettings.isProfilePrivate}
            onChange={() => togglePrivacySetting("isProfilePrivate")}
            id="privacy-toggle"
            aria-label="Toggle private profile"
            title="Toggle private profile"
          />
          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-hidden peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
        </label>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        {Object.entries(privacySettings)
          .filter(([key]) => key !== "isProfilePrivate")
          .map(([key, value]) => (
            <label key={key} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={value}
                onChange={() =>
                  togglePrivacySetting(
                    key as keyof PrivacySettingsData
                  )
                }
                disabled={privacySettings.isProfilePrivate}
                className="w-4 h-4 rounded border-gray-300 dark:border-gray-600
                    text-purple-600 focus:ring-purple-500 dark:focus:ring-purple-600
                    dark:bg-gray-700 transition-colors cursor-pointer"
                aria-label={`Show ${key.replace("show", "")}`}
                title={`Toggle visibility of ${key.replace("show", "")}`}
                id={`privacy-${key}`}
              />
              <span className="text-gray-600 dark:text-gray-400">
                Show {key.replace("show", "")}
              </span>
            </label>
          ))}
      </div>
    </div>
  );
}