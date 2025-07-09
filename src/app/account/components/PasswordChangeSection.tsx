'use client';

import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

interface PasswordChangeSectionProps {
  userEmail: string;
  hasPassword: boolean;
  isDiscordUser: boolean;
  onPasswordSet?: () => void;
}

export function PasswordChangeSection({ userEmail, hasPassword, isDiscordUser, onPasswordSet }: PasswordChangeSectionProps) {
  const { update: updateSession } = useSession();
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    
    setIsChangingPassword(true);
    
    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: hasPassword ? passwordData.currentPassword : undefined,
          newPassword: passwordData.newPassword,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password');
      }
      
      toast.success('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      
      // Update session if needed
      await updateSession();
      
      // Call onPasswordSet callback if provided
      onPasswordSet?.();
      
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };
  
  const handleSendResetEmail = async () => {
    if (!userEmail) {
      toast.error('No email address found. Please add an email to your account first.');
      return;
    }
    
    setIsSendingEmail(true);
    
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset email');
      }
      
      setResetEmailSent(true);
      toast.success('Password reset email sent! Check your inbox.');
      
    } catch (error) {
      console.error('Error sending reset email:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send reset email');
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Email Reset Option */}
      {userEmail && (
        <div className={`p-4 rounded-lg border transition-all duration-300 ${
          resetEmailSent 
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
            : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-14 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${
                resetEmailSent ? 'bg-green-500' : 'bg-blue-500'
              }`}>
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className={`text-sm font-medium transition-colors duration-300 ${
                  resetEmailSent 
                    ? 'text-green-800 dark:text-green-200'
                    : 'text-blue-800 dark:text-blue-200'
                }`}>
                  Reset via Email
                </p>
                <p className={`text-xs transition-colors duration-300 ${
                  resetEmailSent 
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-blue-600 dark:text-blue-400'
                }`}>
                  {resetEmailSent 
                    ? `Reset link sent to ${userEmail}`
                    : `Send password reset link to ${userEmail}`
                  }
                </p>
              </div>
            </div>
            <button
              onClick={handleSendResetEmail}
              disabled={isSendingEmail || resetEmailSent}
              className={`relative group px-3 py-1 text-xs rounded-md transition-all duration-300 disabled:opacity-50 flex items-center gap-1 overflow-hidden ${
                resetEmailSent
                  ? 'bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-700 dark:text-green-300'
                  : 'bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300'
              }`}
            >
              {/* Discord-style glowing background effect */}
              <div className={`absolute inset-0 opacity-0 transition-opacity duration-300 rounded-md ${
                resetEmailSent
                  ? 'bg-gradient-to-r from-green-400/20 via-green-500/10 to-green-400/20 group-hover:opacity-100'
                  : 'bg-gradient-to-r from-blue-400/20 via-blue-500/10 to-blue-400/20 group-hover:opacity-100'
              }`}></div>
              <span className="relative z-10">
                {isSendingEmail ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Sending...
                  </>
                ) : resetEmailSent ? (
                  'Email Sent ✓'
                ) : (
                  'Send Reset Link'
                )}
               </span>
            </button>
          </div>
          
          {/* Success Banner */}
          {resetEmailSent && (
            <div className="mt-3 p-3 bg-green-100 dark:bg-green-900/30 rounded-md border border-green-200 dark:border-green-700 animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    Password reset email sent successfully!
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    Please check your inbox and follow the instructions to reset your password.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Direct Password Change */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
              {hasPassword ? 'Change Password' : 'Set Password'}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {isDiscordUser && !hasPassword 
                ? 'Set a password to enable email/password login'
                : hasPassword 
                ? 'Update your current password'
                : 'Create a password for your account'
              }
            </p>
          </div>
        </div>
        
        <form onSubmit={handlePasswordChange} className="space-y-3">
          {/* Current Password (only if user has a password) */}
          {hasPassword && (
            <div className="space-y-1">
              <label className="text-xs text-gray-600 dark:text-gray-400">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  required
                  className="w-full p-2 pr-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 text-sm"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}
          
          {/* New Password */}
          <div className="space-y-1">
            <label className="text-xs text-gray-600 dark:text-gray-400">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                required
                minLength={6}
                className="w-full p-2 pr-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 text-sm"
                placeholder="Enter new password (min. 6 characters)"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          {/* Confirm Password */}
          <div className="space-y-1">
            <label className="text-xs text-gray-600 dark:text-gray-400">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                required
                className="w-full p-2 pr-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 text-sm"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          {/* Submit Button */}
          <button
            type="submit"
            disabled={isChangingPassword || !passwordData.newPassword || !passwordData.confirmPassword || (hasPassword && !passwordData.currentPassword)}
            className="w-full mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
          >
            {isChangingPassword ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {hasPassword ? 'Changing...' : 'Setting...'}
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {hasPassword ? 'Change Password' : 'Set Password'}
              </>
            )}
          </button>
        </form>
      </div>
      
      {/* Info for Discord users */}
      {isDiscordUser && !hasPassword && (
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <p className="text-xs text-yellow-800 dark:text-yellow-200">
            💡 <strong>Discord User:</strong> You can set a password to enable login with email/password in addition to Discord.
          </p>
        </div>
      )}
    </div>
  );
}