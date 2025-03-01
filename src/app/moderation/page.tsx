'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import ModerationDashboard from './components/ModerationDashboard';

export default function ModerationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      const userRole = session?.user?.role;
      if (!userRole || !['moderator', 'admin'].includes(userRole)) {
        router.push('/');
      }
    } else if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!session?.user?.role || !['moderator', 'admin'].includes(session.user.role)) {
    return null;
  }

  return <ModerationDashboard />;
}
