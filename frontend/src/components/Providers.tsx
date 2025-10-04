'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Polling configuration for real-time updates
        refetchInterval: 3000, // Poll every 3 seconds
        staleTime: 1000, // Consider data stale after 1 second
        retry: 3, // Retry failed requests 3 times
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      mutations: {
        retry: 1, // Retry failed mutations once
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <PrivyProvider
          appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'your-privy-app-id'}
          config={{
            // Configure appearance
            appearance: {
              theme: 'light',
              accentColor: '#676FFF',
            },
            // Only allow wallet connections (no embedded wallets)
            embeddedWallets: {
              ethereum: {
                createOnLogin: 'off',
              },
            },
            // Configure login methods to only show wallet connection
            loginMethods: ['wallet'],
          }}
        >
          {children}
        </PrivyProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
