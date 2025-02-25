import { NextResponse } from 'next/server';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

export function rateLimit(
  key: string = 'default',
  limit: number = 5, 
  timeWindowInSeconds: number = 60
) {
  const now = Date.now();
  const windowStart = now - (timeWindowInSeconds * 1000);

  // Clean up old entries
  for (const k in store) {
    if (store[k].resetTime < windowStart) {
      delete store[k];
    }
  }

  // Get or create entry
  if (!store[key]) {
    store[key] = {
      count: 0,
      resetTime: now + (timeWindowInSeconds * 1000)
    };
  }

  // Reset if time window has passed
  if (store[key].resetTime < now) {
    store[key] = {
      count: 0,
      resetTime: now + (timeWindowInSeconds * 1000)
    };
  }

  // Increment count
  store[key].count++;

  // Check if over limit
  const isRateLimited = store[key].count > limit;

  if (isRateLimited) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  return null;
}
