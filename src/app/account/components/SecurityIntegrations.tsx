'use client';

import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import DiscordButton from '@/components/DiscordButton';
import { PasswordChangeSection } from './PasswordChangeSection';

interface UserInfo {
  hasPassword: boolean;
  discordId: string | null;
}

interface SecurityIntegrationsProps {
  userInfo: UserInfo;
  setUserInfo: (userInfo: UserInfo | ((prev: UserInfo) => UserInfo)) => void;
  profileEmail: string;
}

export function SecurityIntegrations({
  userInfo,
  setUserInfo,
  profileEmail
}: SecurityIntegrationsProps) {
  const { data: session, update: updateSession } = useSession();

  return (
    <div className="p-6 rounded-xl bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800 space-y-6">
      {/* Discord Integration */}
      <div>
        <h3 className="text-lg font-[family-name:var(--font-geist-mono)] text-gray-800 dark:text-gray-400 mb-4">
          Discord Integration
        </h3>
        <div className="space-y-4">
          {userInfo.discordId ? (
            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-10 bg-[#5865F2] rounded-full flex items-center justify-center overflow-hidden">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    Discord Connected
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    {session?.user?.name || 'Discord User'}
                  </p>
                </div>
              </div>
              <button
                onClick={async () => {
                  try {
                    const response = await fetch('/api/user/link-discord', {
                      method: 'DELETE',
                    });
                    if (response.ok) {
                      await updateSession();
                      setUserInfo(prev => ({ ...prev, discordId: null }));
                      toast.success('Discord account unlinked successfully');
                    } else {
                      toast.error('Failed to unlink Discord account');
                    }
                  } catch (error) {
                    toast.error('Failed to unlink Discord account');
                  }
                }}
                className="px-3 py-1 text-xs bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 rounded-md transition-colors"
              >
                Unlink
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-12 h-10 bg-gray-400 rounded-full flex items-center justify-center overflow-hidden">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Discord Not Connected
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Link your Discord account for easier login
                </p>
              </div>
            </div>
            <div className="flex justify-start">
              <div className="w-fit">
                <DiscordButton 
                  text="Link" 
                  variant="link" 
                  disabled={false}
                />
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
      
      {/* Password Management */}
      <div>
        <h3 className="text-lg font-[family-name:var(--font-geist-mono)] text-gray-800 dark:text-gray-400 mb-4">
          Password Management
        </h3>
        <PasswordChangeSection 
          userEmail={profileEmail}
          hasPassword={userInfo.hasPassword}
          isDiscordUser={!!userInfo.discordId}
          onPasswordSet={() => setUserInfo(prev => ({ ...prev, hasPassword: true }))}
        />
      </div>
    </div>
  );
}