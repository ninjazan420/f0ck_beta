'use client';

import { useState, useEffect } from 'react';
import { RandomLogo } from "@/components/RandomLogo";
import { CommentModeration } from './CommentModeration';
import { Footer } from "@/components/Footer";
import { RecentActivity } from './RecentActivity';
import { ModActionsPanel } from './ModActionsPanel';
import { ReportedComments } from './ReportedComments';

// Tabs für verschiedene Bereiche
type ModTab = 'overview' | 'reports' | 'comments' | 'activity' | 'actions';

export default function ModerationDashboard() {
  const [activeTab, setActiveTab] = useState<ModTab>('overview');
  const [reportCount, setReportCount] = useState(0);
  
  // Neue Funktion zum Abrufen der Report-Anzahl
  useEffect(() => {
    const fetchReportCount = async () => {
      try {
        const response = await fetch(`/api/moderation/stats?_cache=${Date.now()}`);
        if (response.ok) {
          const data = await response.json();
          setReportCount(data.reportedComments || 0);
        }
      } catch (error) {
        console.error('Failed to fetch report count:', error);
      }
    };
    
    fetchReportCount();
    const intervalId = setInterval(fetchReportCount, 60000);
    return () => clearInterval(intervalId);
  }, []);
  
  // Tab-Wechsel-Funktionalität
  const renderTabContent = () => {
    switch (activeTab) {
      case 'reports':
        return (
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700/30 p-6">
            <h2 className="text-xl font-[family-name:var(--font-geist-mono)] mb-4 text-center py-2 rounded-lg bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/30">
              Reported Comments
            </h2>
            <ReportedComments />
          </div>
        );
      case 'comments':
        return (
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700/30 p-6">
            <h2 className="text-xl font-[family-name:var(--font-geist-mono)] mb-4 text-center py-2 rounded-lg bg-green-500/20 text-green-700 dark:text-green-300 border border-green-500/30">
              Comment Moderation
            </h2>
            <CommentModeration />
          </div>
        );
      case 'activity':
        return (
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700/30 p-6">
            <h2 className="text-xl font-[family-name:var(--font-geist-mono)] mb-4 text-center py-2 rounded-lg bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30">
              Moderation Activity Log
            </h2>
            <RecentActivity />
          </div>
        );
      case 'actions':
        return <ModActionsPanel />;
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Linke Spalte mit Recent Activity */}
            <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700/30 p-6 h-full">
              <h2 className="text-xl font-[family-name:var(--font-geist-mono)] mb-4 text-center py-2 rounded-lg bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                Recent Activity
              </h2>
              <RecentActivity />
            </div>
            
            {/* Mittlere Spalte mit Comment Feed */}
            <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700/30 p-6 h-full">
              <h2 className="text-xl font-[family-name:var(--font-geist-mono)] mb-4 text-center py-2 rounded-lg bg-green-500/20 text-green-700 dark:text-green-300 border border-green-500/30">
                Latest Comments
              </h2>
              <CommentModeration />
            </div>
            
            {/* Rechte Spalte mit Mod Actions */}
            <div>
              <ModActionsPanel />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-[calc(100vh-36.8px)] flex flex-col">
      <div className="w-full flex justify-center py-8">
        <RandomLogo />
      </div>

      <div className="container mx-auto px-4 py-4 max-w-6xl flex-grow">
        <h1 className="text-3xl font-[family-name:var(--font-geist-mono)] mb-8 text-center text-black dark:text-gray-400">
          Moderation Dashboard
        </h1>
        
        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-md shadow-sm">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                activeTab === 'overview' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-4 py-2 text-sm font-medium border-l border-gray-300 dark:border-gray-700 relative ${
                activeTab === 'reports' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
              }`}
            >
              Reports
              {reportCount > 0 && (
                <span className="absolute -top-2 -right-2 px-1.5 py-0.5 text-xs font-medium rounded-full bg-red-500 text-white">
                  {reportCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`px-4 py-2 text-sm font-medium border-l border-gray-300 dark:border-gray-700 ${
                activeTab === 'comments' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
              }`}
            >
              Comments
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`px-4 py-2 text-sm font-medium border-l border-gray-300 dark:border-gray-700 ${
                activeTab === 'activity' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
              }`}
            >
              Activity Log
            </button>
            <button
              onClick={() => setActiveTab('actions')}
              className={`px-4 py-2 text-sm font-medium border-l border-gray-300 dark:border-gray-700 rounded-r-lg ${
                activeTab === 'actions' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
              }`}
            >
              Mod Actions
            </button>
          </div>
        </div>
        
        {/* Content based on selected tab */}
        {renderTabContent()}
      </div>
      
      <Footer />
    </div>
  );
} 