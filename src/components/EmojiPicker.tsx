'use client';

import { useState, useRef, useEffect } from 'react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

interface EmojiData {
  native: string;
  id: string;
  unified: string;
}

export function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (!mounted) return null;

  return (
    <div
      ref={containerRef}
      className="absolute top-full left-0 mt-2 z-50 rounded-lg shadow-lg overflow-hidden"
    >
      <Picker
        data={data}
        onEmojiSelect={(emojiData: EmojiData) => {
          if (emojiData?.native) {
            onSelect(emojiData.native);
          }
        }}
        theme="light"
        previewPosition="none"
        skinTonePosition="none"
        searchPosition="none"
        navPosition="none"
        perLine={8}
        maxFrequentRows={1}
      />
    </div>
  );
}