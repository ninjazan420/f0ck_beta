import { NextResponse, NextRequest } from 'next/server';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

// Legacy function for backward compatibility
export function rateLimitLegacy(
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

// New async function for email routes
interface RateLimitOptions {
  request: NextRequest;
  limit: number;
  window: number; // in milliseconds
  message?: string;
}

interface RateLimitResult {
  success: boolean;
  message?: string;
}

export async function rateLimit(options: RateLimitOptions): Promise<RateLimitResult> {
  const { request, limit, window, message = 'Too many requests. Please try again later.' } = options;
  
  // Get IP address from request
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'anonymous';
  
  const key = `rate_limit_${ip}`;
  const now = Date.now();
  const windowStart = now - window;

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
      resetTime: now + window
    };
  }

  // Reset if time window has passed
  if (store[key].resetTime < now) {
    store[key] = {
      count: 0,
      resetTime: now + window
    };
  }

  // Increment count
  store[key].count++;

  // Check if over limit
  const isRateLimited = store[key].count > limit;

  return {
    success: !isRateLimited,
    message: isRateLimited ? message : undefined
  };
}
