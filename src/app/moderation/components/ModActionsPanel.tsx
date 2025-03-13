'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type ActionTargetType = 'post' | 'comment' | 'user' | 'tag';

export function ModActionsPanel() {
  const [action, setAction] = useState('');
  const [targetId, setTargetId] = useState('');
  const [reason, setReason] = useState('');
  const [activeTab, setActiveTab] = useState<ActionTargetType>('post');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultMessage, setResultMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  
  const router = useRouter();

  // Definiere verfügbare Aktionen basierend auf Zieltyp
  const getAvailableActions = (targetType: ActionTargetType) => {
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
      case 'tag':
        return [
          { value: 'delete', label: 'Delete Tag' }
        ];
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
          targetType: activeTab,
          targetId,
          reason
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to perform moderation action');
      }
      
      setResultMessage({
        type: 'success',
        text: data.message || 'Action completed successfully'
      });
      
      // Reset form
      setAction('');
      setTargetId('');
      setReason('');
      
      // Refresh the dashboard in background
      router.refresh();
    } catch (error) {
      setResultMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'An error occurred'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Bei Tab-Wechsel Action zurücksetzen
  const handleTabChange = (tab: ActionTargetType) => {
    setActiveTab(tab);
    setAction('');
  };

  return (
    <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700/30 p-6">
      <h2 className="text-xl font-[family-name:var(--font-geist-mono)] mb-4 text-center py-2 rounded-lg bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/30">
        Moderation Actions
      </h2>
      
      {/* Tab Navigation */}
      <div className="flex mb-5 border-b border-gray-300 dark:border-gray-700">
        <button
          onClick={() => handleTabChange('post')}
          className={`py-2 px-4 font-medium ${
            activeTab === 'post'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Posts
        </button>
        <button
          onClick={() => handleTabChange('comment')}
          className={`py-2 px-4 font-medium ${
            activeTab === 'comment'
              ? 'text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Comments
        </button>
        <button
          onClick={() => handleTabChange('user')}
          className={`py-2 px-4 font-medium ${
            activeTab === 'user'
              ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Users
        </button>
        <button
          onClick={() => handleTabChange('tag')}
          className={`py-2 px-4 font-medium ${
            activeTab === 'tag'
              ? 'text-yellow-600 dark:text-yellow-400 border-b-2 border-yellow-600 dark:border-yellow-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Tags
        </button>
      </div>
      
      {resultMessage && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          resultMessage.type === 'success' 
            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-900/50' 
            : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-900/50'
        }`}>
          {resultMessage.text}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
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
            <option value="">Select an action for {activeTab}</option>
            {getAvailableActions(activeTab).map(actionOption => (
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
            placeholder={`Enter ${activeTab} ID`}
            className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
            required
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {activeTab === 'post' ? 'Enter post numeric ID or ObjectID' : 
             activeTab === 'user' ? 'Enter username or user ID' : 
             activeTab === 'tag' ? 'Enter tag name or tag ID' :
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