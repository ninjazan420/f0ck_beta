'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getRandomLogo } from '@/lib/utils';
import { usePathname } from 'next/navigation';

export function RandomLogo() {
  const [logoSrc, setLogoSrc] = useState('/logos/1.png');
  const pathname = usePathname();

  useEffect(() => {
    setLogoSrc(getRandomLogo());
  }, []);

  const handleLogoClick = () => {
    setLogoSrc(getRandomLogo());
  };

  return (
    <Link 
      href={pathname} 
      className="relative w-[308px] h-[63px] logo-container"
      onClick={handleLogoClick}
    >
      <Image
        src={logoSrc}
        alt="f0ck.org Logo"
        fill
        priority
        className="object-contain"
      />
    </Link>
  );
}
