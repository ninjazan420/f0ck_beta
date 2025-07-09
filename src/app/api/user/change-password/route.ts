import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import User from '@/models/User';
import dbConnect from '@/lib/db/mongodb';
import bcrypt from 'bcryptjs';
import { rateLimit } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - max 5 password change attempts per 15 minutes per IP
    const rateLimitResult = await rateLimit({
      request,
      limit: 5,
      window: 15 * 60 * 1000, // 15 minutes
      message: 'Too many password change attempts. Please try again later.'
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: rateLimitResult.message },
        { status: 429 }
      );
    }

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { currentPassword, newPassword } = await request.json();

    // Validate new password
    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find user
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user has a current password
    const hasCurrentPassword = !!user.password;

    // If user has a password, verify current password
    if (hasCurrentPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: 'Current password is required' },
          { status: 400 }
        );
      }

      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        );
      }
    }

    // Hash new password
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update user password
    user.password = hashedNewPassword;
    await user.save();

    console.log(`Password ${hasCurrentPassword ? 'changed' : 'set'} for user:`, user.username);

    return NextResponse.json({
      message: `Password ${hasCurrentPassword ? 'changed' : 'set'} successfully`
    });

  } catch (error) {
    console.error('Error in change-password API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}