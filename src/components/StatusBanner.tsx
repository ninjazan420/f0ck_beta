'use client';

import { useState, useEffect } from 'react';

interface StatusBannerProps {
  show: boolean;
  message: string;
  type?: 'default' | 'success';
}

export const StatusBanner = ({ show, message, type = 'default' }: StatusBannerProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!isVisible) return null;

  const styles = {
    default: 'bg-[#1a4726]/90 text-emerald-100 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]',
    success: 'bg-[#2A1736]/90 text-purple-100 border-purple-500/30 shadow-[0_0_15px_rgba(147,51,234,0.15)]'
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
      <div className={`px-6 py-2 rounded-lg text-center backdrop-blur-sm border ${styles[type]} min-w-[200px]`}>
        <span className="font-mono tracking-wide text-sm">
          {message}
        </span>
      </div>
    </div>
  );
};
