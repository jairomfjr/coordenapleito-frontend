'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from '@/contexts/AuthContext';
import { DevApiHint } from '@/components/DevApiHint';
import { getQueryClient } from '@/lib/query-client';

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <DevApiHint />
        {children}
        <ToastContainer position="top-right" autoClose={4000} style={{ width: '35%' }} />
      </AuthProvider>
    </QueryClientProvider>
  );
}
