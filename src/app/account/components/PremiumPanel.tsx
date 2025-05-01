'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Loader2, Download, Calendar, CreditCard, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { de } from 'date-fns/locale';
import { toast } from 'sonner';

interface PremiumInfo {
  isActive: boolean;
  subscriptionId?: string;
  customerId?: string;
  plan?: 'monthly' | 'yearly';
  startDate?: string;
  endDate?: string;
  cancelAtPeriodEnd?: boolean;
  invoices?: Array<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    created: string;
    invoiceUrl?: string;
    receiptUrl?: string;
  }>;
}

export function PremiumPanel() {
  const { data: session } = useSession();
  const [premiumInfo, setPremiumInfo] = useState<PremiumInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isReactivating, setIsReactivating] = useState(false);

  useEffect(() => {
    const fetchPremiumInfo = async () => {
      if (!session?.user) return;
      
      try {
        setIsLoading(true);
        const response = await fetch('/api/user/premium');
        
        if (response.ok) {
          const data = await response.json();
          setPremiumInfo(data.premium);
        }
      } catch (error) {
        console.error('Error fetching premium info:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPremiumInfo();
  }, [session]);

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your premium subscription? You will still have access until the end of your current billing period.')) {
      return;
    }
    
    try {
      setIsCancelling(true);
      const response = await fetch('/api/user/premium', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'cancel' }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Subscription canceled successfully');
        setPremiumInfo(prev => prev ? {
          ...prev,
          cancelAtPeriodEnd: true
        } : null);
      } else {
        throw new Error(data.error || 'Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast.error('Failed to cancel subscription');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleReactivateSubscription = async () => {
    try {
      setIsReactivating(true);
      const response = await fetch('/api/user/premium', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'reactivate' }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Subscription reactivated successfully');
        setPremiumInfo(prev => prev ? {
          ...prev,
          cancelAtPeriodEnd: false
        } : null);
      } else {
        throw new Error(data.error || 'Failed to reactivate subscription');
      }
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      toast.error('Failed to reactivate subscription');
    } finally {
      setIsReactivating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10 border border-purple-100 dark:border-purple-800/20">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
        </div>
      </div>
    );
  }

  if (!premiumInfo?.isActive) {
    return (
      <div className="p-6 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10 border border-purple-100 dark:border-purple-800/20">
        <div className="text-center py-6 space-y-4">
          <h3 className="text-xl font-[family-name:var(--font-geist-mono)] text-gray-900 dark:text-gray-100">
            Upgrade to Premium 💎
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Unlock all premium features and benefits
          </p>
          <Link
            href="/premium"
            className="inline-block px-6 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium transition-all"
          >
            Get Premium
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10 border border-purple-100 dark:border-purple-800/20">
      <h3 className="text-xl font-[family-name:var(--font-geist-mono)] text-gray-900 dark:text-gray-100 mb-4">
        Premium Membership 💎
      </h3>
      
      {/* Status */}
      <div className="mb-6 flex items-center">
        <div className="flex-shrink-0 mr-3">
          {premiumInfo.cancelAtPeriodEnd ? (
            <AlertTriangle className="w-6 h-6 text-yellow-500" />
          ) : (
            <CheckCircle className="w-6 h-6 text-green-500" />
          )}
        </div>
        <div>
          <div className="font-medium">
            {premiumInfo.cancelAtPeriodEnd
              ? 'Subscription will end soon'
              : 'Active Subscription'}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {premiumInfo.cancelAtPeriodEnd
              ? `Access until ${premiumInfo.endDate ? format(new Date(premiumInfo.endDate), 'PPP', { locale: de }) : 'unknown'}`
              : 'Your premium membership is active'}
          </div>
        </div>
      </div>
      
      {/* Subscription Details */}
      <div className="space-y-4 mb-6">
        <div className="flex items-start">
          <CreditCard className="w-5 h-5 mr-3 text-purple-600 mt-0.5" />
          <div>
            <div className="font-medium">Subscription Plan</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {premiumInfo.plan === 'yearly' ? 'Yearly Premium' : 'Monthly Premium'}
            </div>
          </div>
        </div>
        
        <div className="flex items-start">
          <Calendar className="w-5 h-5 mr-3 text-purple-600 mt-0.5" />
          <div>
            <div className="font-medium">Start Date</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {premiumInfo.startDate
                ? format(new Date(premiumInfo.startDate), 'PPP', { locale: de })
                : 'Unknown'}
            </div>
          </div>
        </div>
        
        <div className="flex items-start">
          <Calendar className="w-5 h-5 mr-3 text-purple-600 mt-0.5" />
          <div>
            <div className="font-medium">Next Billing Date</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {premiumInfo.endDate
                ? format(new Date(premiumInfo.endDate), 'PPP', { locale: de })
                : 'Unknown'}
            </div>
          </div>
        </div>
      </div>
      
      {/* Invoices */}
      {premiumInfo.invoices && premiumInfo.invoices.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium mb-3">Payment History</h4>
          <div className="space-y-2">
            {premiumInfo.invoices.map(invoice => (
              <div key={invoice.id} className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                <div>
                  <div className="font-medium">
                    {format(new Date(invoice.created), 'PPP', { locale: de })}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {(invoice.amount / 100).toFixed(2)} {invoice.currency.toUpperCase()}
                  </div>
                </div>
                <div className="flex space-x-2">
                  {invoice.receiptUrl && (
                    <a
                      href={invoice.receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-purple-600 hover:text-purple-700 transition-colors"
                      title="Download Receipt"
                    >
                      <Download className="w-5 h-5" />
                    </a>
                  )}
                  {invoice.invoiceUrl && (
                    <a
                      href={invoice.invoiceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-purple-600 hover:text-purple-700 transition-colors"
                      title="View Invoice"
                    >
                      <CreditCard className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {premiumInfo.cancelAtPeriodEnd ? (
          <button
            onClick={handleReactivateSubscription}
            disabled={isReactivating}
            className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
          >
            {isReactivating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Reactivating...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Reactivate Subscription
              </>
            )}
          </button>
        ) : (
          <button
            onClick={handleCancelSubscription}
            disabled={isCancelling}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
          >
            {isCancelling ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Cancelling...
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 mr-2" />
                Cancel Subscription
              </>
            )}
          </button>
        )}
        
        <Link
          href="/premium"
          className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium transition-all"
        >
          Manage Plan
        </Link>
      </div>
    </div>
  );
}
