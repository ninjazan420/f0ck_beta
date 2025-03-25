'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    // Load settings from localStorage
    const settings = localStorage.getItem('settings');
    if (settings) {
      const parsedSettings = JSON.parse(settings);
      const savedTheme = parsedSettings.darkTheme ? 'dark' : 'light';
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', parsedSettings.darkTheme);
    } else {
      // Check system preference if no settings exist
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', prefersDark);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    
    // Update localStorage
    const settings = localStorage.getItem('settings');
    const parsedSettings = settings ? JSON.parse(settings) : {};
    localStorage.setItem('settings', JSON.stringify({
      ...parsedSettings,
      darkTheme: newTheme === 'dark'
    }));

    // Ensure correct class application
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
