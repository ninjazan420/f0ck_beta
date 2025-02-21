'use client';

import { useState, useEffect } from 'react';

export const LogoutBanner = ({ show }: { show: boolean }) => {
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

  return (
    <div className="fixed top-0 left-0 right-0 bg-green-500 text-white py-2 text-center transition-all duration-300 ease-in-out">
      Logging out...
    </div>
  );
};
