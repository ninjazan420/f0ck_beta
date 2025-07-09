import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import User from '@/models/User';
import { sendEmail, getPasswordResetEmailTemplate } from '@/lib/email';
import crypto from 'crypto';
import { rateLimit } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - max 3 requests per 15 minutes per IP
    const rateLimitResult = await rateLimit({
      request,
      limit: 3,
      window: 15 * 60 * 1000, // 15 minutes
      message: 'Too many password reset requests. Please try again later.'
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: rateLimitResult.message },
        { status: 429 }
      );
    }

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find user by email (case insensitive)
    const user = await User.findOne({
      email: { $regex: new RegExp(`^${email}$`, 'i') }
    });

    // Always return success to prevent email enumeration attacks
    // But only send email if user exists
    if (user) {
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

      // Save reset token to user
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = resetTokenExpiry;
      await user.save();

      // Create reset URL
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

      // Get email template
      const emailTemplate = getPasswordResetEmailTemplate(resetUrl, user.username || 'User');

      try {
        // Send email
        await sendEmail({
          to: user.email,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text
        });

        console.log(`Password reset email sent to: ${user.email}`);
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError);
        
        // Clear the reset token if email fails
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        return NextResponse.json(
          { error: 'Failed to send reset email. Please try again later.' },
          { status: 500 }
        );
      }
    } else {
      console.log(`Password reset requested for non-existent email: ${email}`);
    }

    // Always return success response (security best practice)
    return NextResponse.json({
      message: 'If an account with that email exists, we have sent password reset instructions.'
    });

  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}