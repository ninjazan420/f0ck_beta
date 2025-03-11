'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function ModActionsPanel() {
  const [action, setAction] = useState('');
  const [targetId, setTargetId] = useState('');
  const [reason, setReason] = useState('');
  const [targetType, setTargetType] = useState('post');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultMessage, setResultMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  
  const router = useRouter();

  // Definiere verfügbare Aktionen basierend auf Zieltyp
  const getAvailableActions = () => {
    switch(targetType) {
      case 'post':
        return [
          { value: 'delete', label: 'Delete Post' },
          { value: 'disableComments', label: 'Disable Comments' },
          { value: 'enableComments', label: 'Enable Comments' }
        ];
      case 'comment':
        return [
          { value: 'delete', label: 'Delete Comment' },
          { value: 'approve', label: 'Approve Comment' },
          { value: 'reject', label: 'Reject Comment' }
        ];
      case 'user':
        return [
          { value: 'ban', label: 'Ban User' },
          { value: 'unban', label: 'Unban User' },
          { value: 'warn', label: 'Warn User' }
        ];
      default:
        return [];
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!action || !targetId || !reason || isSubmitting) {
      return;
    }
    
    setIsSubmitting(true);
    setResultMessage(null);
    
    try {
      const response = await fetch('/api/moderation/actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action,
          targetType,
          targetId,
          reason
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to perform action');
      }
      
      const result = await response.json();
      
      // Zeige Erfolgsmeldung
      setResultMessage({
        type: 'success',
        text: `Action completed: ${action} on ${targetType} ${targetId}`
      });
      
      // Formular zurücksetzen
      setAction('');
      setTargetId('');
      setReason('');
      
      // Aktualisiere die Seite nach kurzer Verzögerung bei bestimmten Aktionen
      if (action === 'delete') {
        setTimeout(() => {
          router.refresh();
        }, 1500);
      }
      
    } catch (error) {
      console.error('Error performing moderation action:', error);
      setResultMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700/30 p-6">
      <h2 className="text-xl font-[family-name:var(--font-geist-mono)] mb-4 text-center py-2 rounded-lg bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/30">
        Moderation Actions
      </h2>
      
      {resultMessage && (
        <div className={`mb-4 p-3 rounded-lg border ${
          resultMessage.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/30 text-green-700 dark:text-green-300' 
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/30 text-red-700 dark:text-red-300'
        }`}>
          {resultMessage.text}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Target Type
          </label>
          <select
            value={targetType}
            onChange={(e) => {
              setTargetType(e.target.value);
              setAction(''); // Reset action when target type changes
            }}
            className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
            required
          >
            <option value="post">Post</option>
            <option value="comment">Comment</option>
            <option value="user">User</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Action
          </label>
          <select
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
            required
          >
            <option value="">Select an action</option>
            {getAvailableActions().map(actionOption => (
              <option key={actionOption.value} value={actionOption.value}>
                {actionOption.label}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Target ID
          </label>
          <input
            type="text"
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            placeholder={`Enter ${targetType} ID`}
            className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
            required
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {targetType === 'post' ? 'Enter post numeric ID or ObjectID' : 
             targetType === 'user' ? 'Enter username or user ID' : 
             'Enter comment ID'}
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Reason
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Provide a reason for this action"
            className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
            rows={3}
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting || !action || !targetId || !reason}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Processing...' : 'Execute Action'}
        </button>
      </form>
    </div>
  );
} 