'use client';
import { useState } from 'react';

const uploadOptions = [
  { id: 'skipDuplicate', label: 'Skip duplicate' }, // This will be used for client-side check for now
  { id: 'forceUploadSimilar', label: 'Force upload similar' }, // This implies server-side check
  // { id: 'pauseOnError', label: 'Pause on error' }, // Removed as per request
  { id: 'uploadAnonymously', label: 'Upload anonymously' }
] as const;

type OptionId = typeof uploadOptions[number]['id'];

export function UploadOptions() {
  const [options, setOptions] = useState<Record<OptionId, boolean>>({
    skipDuplicate: true, // Default to true for client-side duplicate check
    forceUploadSimilar: false,
    // pauseOnError: false, // Removed
    uploadAnonymously: false
  });

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <h3 className="text-lg font-[family-name:var(--font-geist-mono)] text-gray-800 dark:text-gray-400">
          Upload Options
        </h3>
        <div className="grid grid-cols-2 gap-x-8 gap-y-3">
          {uploadOptions.map(({ id, label }) => (
            <div key={id} className="flex items-center gap-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options[id]}
                  onChange={e => setOptions(prev => ({ ...prev, [id]: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 
                    text-purple-600 focus:ring-purple-500 dark:focus:ring-purple-600
                    dark:bg-gray-700 transition-colors cursor-pointer"
                />
                <span className="select-none text-gray-600 dark:text-gray-400 cursor-pointer">
                  {label}
                </span>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
