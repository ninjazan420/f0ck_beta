import nodemailer from 'nodemailer';

// Email configuration
const createTransporter = () => {
  // For development, you can use a service like Gmail or a test service
  // For production, configure with your actual SMTP settings
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production'
    }
  });
};

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

// Email templates
export const getPasswordResetEmailTemplate = (resetUrl: string, username: string) => {
  return {
    subject: 'Reset Your Password - f0ck.org',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
          }
          .container {
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #8B5CF6;
            margin-bottom: 10px;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background: linear-gradient(135deg, #8B5CF6, #A855F7);
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            margin: 20px 0;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 14px;
            color: #666;
          }
          .warning {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 15px;
            border-radius: 4px;
            margin: 20px 0;
            color: #856404;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <a href="https://f0ck.org" style="display: inline-block; margin-bottom: 10px;">
              <img src="https://f0ck.org/logos/1.png" alt="f0ck.org" style="width: 50%; height: auto; max-width: 200px;" />
            </a>
            <h1>Reset Your Password</h1>
          </div>
          
          <p>Hello ${username},</p>
          
          <p>We received a request to reset the password for your f0ck.org account. If you made this request, click the button below to reset your password:</p>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </div>
          
          <div class="warning">
            <strong>Important:</strong> This link will expire in 1 hour for security reasons.
          </div>
          
          <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
          
          <p>If the button above doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #8B5CF6;">${resetUrl}</p>
          
          <div class="footer">
            <p>Best regards,<br>The f0ck.org Team</p>
            <p><small>This is an automated message. Please do not reply to this email.</small></p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Reset Your Password - f0ck.org
      
      Hello ${username},
      
      We received a request to reset the password for your f0ck.org account.
      
      To reset your password, visit this link:
      ${resetUrl}
      
      This link will expire in 1 hour for security reasons.
      
      If you didn't request a password reset, you can safely ignore this email.
      
      Best regards,
      The f0ck.org Team
    `
  };
};