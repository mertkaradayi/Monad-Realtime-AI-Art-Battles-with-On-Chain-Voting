'use client';

import { PrivyProvider } from '@privy-io/react-auth';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
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
  );
}
