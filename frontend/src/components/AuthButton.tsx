'use client';

import { usePrivy, useLogin, useLogout } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { LogIn, LogOut, User, Wallet } from 'lucide-react';

export function AuthButton() {
  const { ready, authenticated, user } = usePrivy();
  const { login } = useLogin();
  const { logout } = useLogout();

  if (!ready) {
    return (
      <Button disabled variant="outline">
        Loading...
      </Button>
    );
  }

  if (!authenticated) {
    return (
      <Button onClick={login} className="gap-2">
        <LogIn className="h-4 w-4" />
        Sign In
      </Button>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          {user?.wallet?.address ? `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}` : 'User'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Account</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback>
                <User className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">
                Wallet Connected
              </p>
              <p className="text-sm text-muted-foreground font-mono">
                {user?.wallet?.address || 'No wallet connected'}
              </p>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Wallet Information</h4>
            {user?.wallet && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <Wallet className="h-4 w-4" />
                  <span className="font-mono text-xs">
                    {user.wallet.address}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Chain: {user.wallet.chainType || 'Ethereum'}
                </div>
              </div>
            )}
          </div>

          <Separator />

          <Button 
            onClick={logout} 
            variant="outline" 
            className="w-full gap-2"
          >
            <LogOut className="h-4 w-4" />
            Disconnect Wallet
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
