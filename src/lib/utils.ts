import fs from 'fs';
import path from 'path';

export function getRandomLogo(): string {
  const logoDir = path.join(process.cwd(), 'public', 'logos');
  const files = fs.readdirSync(logoDir)
    .filter(file => /\.(png|jpe?g)$/i.test(file));
  
  if (files.length === 0) return '/logos/1.png'; // Fallback
  
  const randomFile = files[Math.floor(Math.random() * files.length)];
  return `/logos/${randomFile}`;
}
