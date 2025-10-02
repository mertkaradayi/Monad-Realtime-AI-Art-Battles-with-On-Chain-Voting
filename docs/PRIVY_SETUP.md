# Privy Authentication Setup - MetaMask Only

This project now includes Privy authentication integration for MetaMask wallet connection only.

## Setup Instructions

### 1. Create a Privy Account
1. Go to [Privy Dashboard](https://dashboard.privy.io/)
2. Create a new account or sign in
3. Create a new app
4. Copy your App ID

### 2. Configure Environment Variables
Create a `.env.local` file in the `frontend` directory:

```bash
# Privy Configuration
NEXT_PUBLIC_PRIVY_APP_ID=your-privy-app-id-here

# Supabase Configuration (if needed)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Update Privy App Configuration
In the Privy Dashboard:
1. Go to your app settings
2. Enable wallet connections (MetaMask will be available by default)
3. Set up allowed redirect URLs
4. Disable embedded wallets (we're using external wallet connections only)

### 4. Run the Application
```bash
cd frontend
npm run dev
```

## Features Implemented

### Authentication Components
- **LoginPage**: Clean wallet connection interface for MetaMask
- **AuthButton**: Wallet account management with address information
- **Providers**: Privy provider setup for wallet-only authentication

### Authentication Methods
- MetaMask wallet connection only
- External wallet authentication
- No embedded wallets (users must have their own MetaMask)

### User Experience
- MetaMask wallet connection required
- Wallet address display and management
- Secure wallet-based authentication flow
- Responsive design using shadcn/ui components

## Usage

1. **Unauthenticated Users**: See the login page with MetaMask connection option
2. **Authenticated Users**: Access the main application with wallet address in the header
3. **Account Management**: Click the wallet button to view wallet information and disconnect

## Next Steps

1. Replace `your-privy-app-id-here` with your actual Privy App ID
2. Ensure MetaMask is installed in your browser
3. Test the wallet connection flow
4. Customize the UI to match your brand

## Troubleshooting

- Ensure your Privy App ID is correctly set in the environment variables
- Make sure MetaMask is installed and unlocked in your browser
- Check that wallet connections are enabled in the Privy Dashboard
- Verify that redirect URLs match your development environment
- Check browser console for any authentication errors
- Ensure you're on a supported network (Ethereum mainnet or testnets)
