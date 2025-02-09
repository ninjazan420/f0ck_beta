'use client';
import { useState } from 'react';

const uploadOptions = [
  { id: 'skipDuplicate', label: 'Skip duplicate' },
  { id: 'forceUploadSimilar', label: 'Force upload similar' },
  { id: 'pauseOnError', label: 'Pause on error' },
  { id: 'uploadAnonymously', label: 'Upload anonymously' }
] as const;

type OptionId = typeof uploadOptions[number]['id'];

export function UploadOptions() {
  const [options, setOptions] = useState<Record<OptionId, boolean>>({
    skipDuplicate: false,
    forceUploadSimilar: false,
    pauseOnError: false,
    uploadAnonymously: false
  });

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-[family-name:var(--font-geist-mono)] text-gray-800 dark:text-gray-400">
        Upload Options
      </h3>
      <div className="grid grid-cols-2 gap-x-8 gap-y-3">
        {uploadOptions.map(({ id, label }) => (
          <label key={id} className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
            <input
              type="checkbox"
              checked={options[id]}
              onChange={e => setOptions(prev => ({ ...prev, [id]: e.target.checked }))}
              className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 
                text-purple-600 focus:ring-purple-500 dark:focus:ring-purple-600
                dark:bg-gray-700 transition-colors"
            />
            <span className="select-none">{label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
