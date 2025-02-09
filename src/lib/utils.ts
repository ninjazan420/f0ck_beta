const LOGOS = [
  '/logos/1.png',
  '/logos/2.png',
  '/logos/3.png',
  '/logos/4.png',
  '/logos/5.png'
];

export function getRandomLogo(): string {
  const randomIndex = Math.floor(Math.random() * LOGOS.length);
  return LOGOS[randomIndex];
}
