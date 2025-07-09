# Email System Setup Guide

This guide explains how to configure the email system for password reset functionality on your 1blu VPS Ubuntu server.

## Overview

The email system has been implemented with the following features:
- Password reset via email
- Secure token-based reset links (1-hour expiration)
- Rate limiting to prevent abuse
- Professional email templates
- Support for various SMTP providers

## Files Created/Modified

### New Files:
- `src/lib/email.ts` - Email utility functions and templates
- `src/app/api/auth/forgot-password/route.ts` - API for requesting password reset
- `src/app/api/auth/reset-password/route.ts` - API for resetting password with token
- `src/app/reset-password/page.tsx` - Reset password page
- `src/app/reset-password/ResetPasswordClient.tsx` - Reset password client component
- `.env.example` - Environment variables template

### Modified Files:
- `src/models/User.ts` - Added reset token fields
- `src/components/auth/ForgotPasswordForm.tsx` - Connected to real API
- `src/app/forgot-password/page.tsx` - Fixed imports

## Environment Variables

Add these variables to your `.env.local` file:

```bash
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com
```

## Email Provider Options

### Option 1: Gmail (Recommended for Development)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
3. **Configure environment variables**:
   ```bash
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-gmail@gmail.com
   SMTP_PASS=your-16-character-app-password
   SMTP_FROM=your-gmail@gmail.com
   ```

### Option 2: SendGrid (Recommended for Production)

1. **Create a SendGrid account** at https://sendgrid.com
2. **Generate an API key**
3. **Configure environment variables**:
   ```bash
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=apikey
   SMTP_PASS=your-sendgrid-api-key
   SMTP_FROM=noreply@yourdomain.com
   ```

### Option 3: Mailgun

1. **Create a Mailgun account** at https://mailgun.com
2. **Get your SMTP credentials**
3. **Configure environment variables**:
   ```bash
   SMTP_HOST=smtp.mailgun.org
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-mailgun-username
   SMTP_PASS=your-mailgun-password
   SMTP_FROM=noreply@yourdomain.com
   ```

### Option 4: Local SMTP Server (Advanced)

If you want to run your own SMTP server on the Ubuntu VPS:

1. **Install Postfix**:
   ```bash
   sudo apt update
   sudo apt install postfix
   ```

2. **Configure Postfix** (select "Internet Site" during installation)

3. **Configure environment variables**:
   ```bash
   SMTP_HOST=localhost
   SMTP_PORT=25
   SMTP_SECURE=false
   SMTP_USER=
   SMTP_PASS=
   SMTP_FROM=noreply@yourdomain.com
   ```

## Ubuntu VPS Configuration

### Required Ports

For external SMTP services (Gmail, SendGrid, etc.):
- **Outbound port 587** (SMTP submission)
- **Outbound port 465** (SMTP over SSL, if using secure=true)
- **Outbound port 25** (traditional SMTP, often blocked by ISPs)

### Check Port Availability

```bash
# Check if ports are open
sudo netstat -tlnp | grep :587
sudo netstat -tlnp | grep :465
sudo netstat -tlnp | grep :25

# Test SMTP connection
telnet smtp.gmail.com 587
```

### Firewall Configuration

If using UFW (Ubuntu Firewall):

```bash
# Allow outbound SMTP
sudo ufw allow out 587
sudo ufw allow out 465
sudo ufw allow out 25

# Check firewall status
sudo ufw status
```

### ISP Considerations

Many ISPs block port 25 to prevent spam. If you encounter issues:

1. **Use port 587 instead** (submission port)
2. **Contact your ISP** to unblock port 25 if needed
3. **Use a third-party email service** (recommended)

## Testing the Email System

### 1. Test Email Configuration

Create a test script to verify email sending:

```javascript
// test-email.js
const { sendEmail } = require('./src/lib/email.ts');

async function testEmail() {
  try {
    await sendEmail({
      to: 'test@example.com',
      subject: 'Test Email',
      html: '<h1>Test Email</h1><p>If you receive this, email is working!</p>'
    });
    console.log('Email sent successfully!');
  } catch (error) {
    console.error('Email failed:', error);
  }
}

testEmail();
```

### 2. Test Password Reset Flow

1. Go to `/forgot-password`
2. Enter a valid email address
3. Check email for reset link
4. Click link to reset password
5. Verify new password works

## Troubleshooting

### Common Issues

1. **"Authentication failed"**
   - Check SMTP credentials
   - For Gmail, ensure app password is used
   - Verify 2FA is enabled for Gmail

2. **"Connection timeout"**
   - Check firewall settings
   - Verify SMTP host and port
   - Test with telnet

3. **"Mail not sent"**
   - Check spam folder
   - Verify SMTP_FROM address
   - Check email provider logs

4. **Rate limiting errors**
   - Wait 15 minutes between attempts
   - Check rate limit configuration

### Debug Mode

Enable debug logging by adding to your environment:

```bash
NODE_ENV=development
DEBUG=nodemailer*
```

## Security Best Practices

1. **Use environment variables** for all sensitive data
2. **Enable rate limiting** (already implemented)
3. **Use HTTPS** in production
4. **Validate email addresses** (already implemented)
5. **Set token expiration** (1 hour, already implemented)
6. **Use app passwords** for Gmail
7. **Monitor email sending** for abuse

## Production Deployment

### Recommended Setup for Production:

1. **Use a dedicated email service** (SendGrid, Mailgun, etc.)
2. **Set up SPF, DKIM, and DMARC** records
3. **Use a custom domain** for sender address
4. **Monitor email delivery rates**
5. **Set up email analytics**

### Environment Variables for Production:

```bash
NEXTAUTH_URL=https://yourdomain.com
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=your-production-api-key
SMTP_FROM=noreply@yourdomain.com
```

## Support

If you encounter issues:

1. Check the server logs for error messages
2. Verify environment variables are set correctly
3. Test SMTP connection manually
4. Check email provider documentation
5. Ensure all required ports are open

The email system is now fully functional and ready for use!