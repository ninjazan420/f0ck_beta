'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { Session } from 'next-auth';

interface AuthContextType {
  user: Session['user'] | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  
  const value: AuthContextType = {
    user: session?.user || null,
    isLoading: status === 'loading',
    isAuthenticated: !!session?.user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}