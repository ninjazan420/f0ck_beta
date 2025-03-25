'use client';

import { useState, useEffect } from 'react';

interface Settings {
  darkTheme?: boolean;
  blurNsfw?: boolean;
  autoplayGifs?: boolean;
  autoplayVideos?: boolean;
  muteAutoplay?: boolean;
  premium?: {
    isActive: boolean;
    hideAds: boolean;
    maxGifSize: boolean;
    keepOriginalVideoQuality: boolean;
    customGridLayout: boolean;
    pools: {
      enabled: boolean;
      maxPools: number;
      publicPools: boolean;
      privatePools: boolean;
    };
    tags: {
      favorites: boolean;
      maxFavorites: number;
      customCategories: boolean;
    };
    notifications: {
      customFilters: boolean;
      mentionAlerts: boolean;
      tagUpdates: boolean;
      poolUpdates: boolean;
      commentReplies: boolean;
      directMessages: boolean;
    };
    messaging: {
      enabled: boolean;
      maxConversations: number;
      attachments: boolean;
      groupChats: boolean;
    };
    nickname?: {
      enabled: boolean;
      style: {
        type: 'solid' | 'gradient' | 'animated';
        color: string;
        gradient: string[];
        animate: boolean;
        animation: string;
      };
    };
  };
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>({
    darkTheme: false,
    blurNsfw: false,
    autoplayGifs: false,
    autoplayVideos: true,
    muteAutoplay: true,
  });

  // Load settings from localStorage on component mount
  useEffect(() => {
    const storedSettings = localStorage.getItem('settings');
    if (storedSettings) {
      try {
        const parsedSettings = JSON.parse(storedSettings);
        setSettings(prev => ({
          ...prev,
          ...parsedSettings
        }));
      } catch (error) {
        console.error('Failed to parse settings from localStorage:', error);
      }
    }
  }, []);

  // Update a specific setting
  const updateSetting = (key: keyof Settings, value: any) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      localStorage.setItem('settings', JSON.stringify(newSettings));
      return newSettings;
    });
  };

  return { settings, updateSetting };
}