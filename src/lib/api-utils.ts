import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import dbConnect from './db/mongodb';

export type ApiResponse<T = unknown> = {
  data?: T;
  error?: string;
};

export async function withAuth<T>(
  handler: (session: Awaited<ReturnType<typeof getServerSession>>) => Promise<T>
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    await dbConnect();
    const result = await handler(session);
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
}

export function createApiResponse<T>(data: T): ApiResponse<T> {
  return { data };
}

export function createErrorResponse(message: string, status = 400): NextResponse {
  return NextResponse.json(
    { error: message },
    { status }
  );
}
