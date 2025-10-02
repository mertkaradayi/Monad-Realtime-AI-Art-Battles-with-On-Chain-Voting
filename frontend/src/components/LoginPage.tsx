'use client';

import { usePrivy, useLogin } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wallet } from 'lucide-react';

export function LoginPage() {
  const { ready, authenticated } = usePrivy();
  const { login } = useLogin();

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (authenticated) {
    return null; // User is already authenticated
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome to Battle Semantic</CardTitle>
          <CardDescription>
            Connect your wallet to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              Connect your MetaMask wallet to access the application. Make sure you have MetaMask installed in your browser.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-3">
            <Button 
              onClick={() => login()} 
              className="w-full gap-2"
              size="lg"
            >
              <Wallet className="h-4 w-4" />
              Connect MetaMask Wallet
            </Button>
          </div>
          
          <div className="text-center text-sm text-muted-foreground">
            By connecting your wallet, you agree to our Terms of Service and Privacy Policy
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
