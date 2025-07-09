'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import styled from 'styled-components';

const ModerationPanel = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 0.75rem;
  padding: 1rem;
  margin-top: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  max-width: 600px;
`;

const PanelTitle = styled.h4`
  color: white;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ActionGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
`;

const ActionButton = styled.button<{ $variant: 'danger' | 'warning' | 'success' | 'primary' }>`
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  color: white;
  white-space: nowrap;
  
  ${props => {
    switch (props.$variant) {
      case 'danger':
        return `
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
          &:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(239, 68, 68, 0.5); }
        `;
      case 'warning':
        return `
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
          &:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(245, 158, 11, 0.5); }
        `;
      case 'success':
        return `
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
          &:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(16, 185, 129, 0.5); }
        `;
      default:
        return `
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
          &:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(59, 130, 246, 0.5); }
        `;
    }
  }}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }
`;

const ReasonInput = styled.textarea`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 0.75rem;
  resize: vertical;
  min-height: 60px;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }
  
  &:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.4);
    background: rgba(255, 255, 255, 0.15);
  }
`;

const StatusMessage = styled.div<{ $type: 'success' | 'error' }>`
  padding: 0.5rem;
  border-radius: 0.5rem;
  margin-top: 0.75rem;
  font-size: 0.75rem;
  
  ${props => props.$type === 'success' ? `
    background: rgba(16, 185, 129, 0.2);
    color: #10b981;
    border: 1px solid rgba(16, 185, 129, 0.3);
  ` : `
    background: rgba(239, 68, 68, 0.2);
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.3);
  `}
`;

interface UserModerationPanelProps {
  targetUsername: string;
  targetRole: string;
  onUserUpdate?: () => void;
}

export function UserModerationPanel({ targetUsername, targetRole, onUserUpdate }: UserModerationPanelProps) {
  const { data: session } = useSession();
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Check if current user has moderation permissions
  if (!session?.user?.role || !['moderator', 'admin'].includes(session.user.role)) {
    return null;
  }

  // Admins can do everything, moderators can't promote to admin or ban other mods/admins
  const canBan = session.user.role === 'admin' || !['moderator', 'admin'].includes(targetRole);
  const canPromoteToMod = session.user.role === 'admin';
  const canPromoteToAdmin = session.user.role === 'admin' && targetRole !== 'admin';

  const handleModerationAction = async (action: string) => {
    if (!reason.trim()) {
      setStatusMessage({ type: 'error', text: 'Please provide a reason for this action.' });
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);

    try {
      const response = await fetch('/api/moderation/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          targetType: 'user',
          targetId: targetUsername,
          reason: reason.trim()
        })
      });

      if (response.ok) {
        setStatusMessage({ type: 'success', text: `Action "${action}" completed successfully.` });
        setReason('');
        onUserUpdate?.();
      } else {
        const errorData = await response.json();
        setStatusMessage({ type: 'error', text: errorData.error || 'Action failed.' });
      }
    } catch (error) {
      setStatusMessage({ type: 'error', text: 'Network error occurred.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (newRole: string) => {
    if (!reason.trim()) {
      setStatusMessage({ type: 'error', text: 'Please provide a reason for this role change.' });
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);

    try {
      const response = await fetch('/api/moderation/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'role_change',
          targetType: 'user',
          targetId: targetUsername,
          reason: reason.trim(),
          newRole
        })
      });

      if (response.ok) {
        setStatusMessage({ type: 'success', text: `User role changed to ${newRole}.` });
        setReason('');
        onUserUpdate?.();
      } else {
        const errorData = await response.json();
        setStatusMessage({ type: 'error', text: errorData.error || 'Role change failed.' });
      }
    } catch (error) {
      setStatusMessage({ type: 'error', text: 'Network error occurred.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ModerationPanel>
      <PanelTitle>
        🛡️ Moderation
      </PanelTitle>
      
      <ReasonInput
        placeholder="Enter reason for moderation action..."
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        disabled={isLoading}
      />
      
      <ActionGrid>
        {canBan && targetRole !== 'banned' && (
          <ActionButton
            $variant="danger"
            onClick={() => handleModerationAction('ban')}
            disabled={isLoading}
          >
            Ban User
          </ActionButton>
        )}
        
        {canBan && targetRole === 'banned' && (
          <ActionButton
            $variant="success"
            onClick={() => handleModerationAction('unban')}
            disabled={isLoading}
          >
            Unban User
          </ActionButton>
        )}
        
        {canPromoteToMod && targetRole === 'user' && (
          <ActionButton
            $variant="primary"
            onClick={() => handleRoleChange('moderator')}
            disabled={isLoading}
          >
            Make Moderator
          </ActionButton>
        )}
        
        {canPromoteToAdmin && targetRole === 'moderator' && (
          <ActionButton
            $variant="warning"
            onClick={() => handleRoleChange('admin')}
            disabled={isLoading}
          >
            Make Admin
          </ActionButton>
        )}
        
        {session.user.role === 'admin' && ['moderator', 'admin'].includes(targetRole) && (
          <ActionButton
            $variant="warning"
            onClick={() => handleRoleChange('user')}
            disabled={isLoading}
          >
            Remove Privileges
          </ActionButton>
        )}
      </ActionGrid>
      
      {statusMessage && (
        <StatusMessage $type={statusMessage.type}>
          {statusMessage.text}
        </StatusMessage>
      )}
    </ModerationPanel>
  );
}
