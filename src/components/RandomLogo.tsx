'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getRandomLogo } from '@/lib/utils';

export function RandomLogo() {
  const [logoSrc, setLogoSrc] = useState('/logos/1.png'); // Default logo

  useEffect(() => {
    setLogoSrc(getRandomLogo());
  }, []);

  return (
    <Link href="/" className="relative w-[308px] h-[63px] logo-container">
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
