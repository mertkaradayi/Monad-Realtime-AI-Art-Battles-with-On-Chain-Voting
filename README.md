# Monad Realtime AI Art Battles with On-Chain Voting

A decentralized AI-powered art battle platform where users can create, vote on, and compete with AI-generated artwork. Built with Next.js, TypeScript, Supabase, and smart contracts for on-chain voting.

## 🚀 Quick Start

```bash
# Install dependencies
npm run install:all

# Set up environment variables (see Environment Variables section below)

# Start development
npm run dev:backend  # Terminal 1
npm run dev:frontend # Terminal 2
```

**Access:**
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## 🎨 What is Battle Semantic?

Battle Semantic is a revolutionary platform that combines AI art generation with blockchain voting. Users can:

- **Create AI Art Battles**: Generate unique artwork using AI and create voting battles
- **Vote with Crypto**: Use your wallet to vote on your favorite artworks
- **Earn Rewards**: Win battles and earn tokens for your creative contributions
- **Real-time Updates**: Watch battles unfold in real-time with live voting results

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 + React 19 + Tailwind CSS + shadcn/ui
- **Backend**: Express.js + TypeScript + Supabase
- **Database**: PostgreSQL (via Supabase) with real-time subscriptions
- **Authentication**: Privy (MetaMask wallet integration)
- **Smart Contracts**: Solidity + Foundry for on-chain voting
- **AI Integration**: FAL.ai for art generation
- **Development**: Monorepo with npm workspaces

## 📜 Available Scripts

```bash
# Development
npm run dev:frontend  # Start frontend development server
npm run dev:backend   # Start backend development server
npm run dev           # Start frontend (alias for dev:frontend)

# Building
npm run build         # Build both frontend and backend
npm run build:frontend # Build frontend only
npm run build:backend  # Build backend only

# Production
npm run start         # Start frontend in production
npm run start:frontend # Start frontend in production
npm run start:backend  # Start backend in production

# Utilities
npm run install:all   # Install all dependencies
npm run type-check    # TypeScript type checking
npm run lint          # Lint frontend code
```

## 🎯 Key Features

- **AI Art Generation**: Create unique artwork using FAL.ai integration
- **On-Chain Voting**: Smart contract-based voting system for battles
- **Real-time Updates**: Live battle results and voting progress
- **Wallet Authentication**: MetaMask integration via Privy
- **Modern UI**: shadcn/ui components with Tailwind CSS
- **Type-Safe**: Full TypeScript implementation
- **Real-time Database**: Supabase PostgreSQL with live subscriptions
- **QR Code Generation**: Easy battle sharing with QR codes

## 🔧 Environment Variables

**Backend (.env):**
```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Privy Configuration
PRIVY_APP_ID=your_privy_app_id
PRIVY_APP_SECRET=your_privy_app_secret

# Fal.ai Configuration
FAL_KEY=your_fal_ai_api_key

# Server Configuration
PORT=3001
NODE_ENV=development
```

**Frontend (.env.local):**
```env
# Privy Configuration
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id_here

# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

> **Note**: Copy the example files and fill in your actual API keys and configuration values.

## 📁 Project Structure

```
battle-semantic/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # App router pages
│   │   ├── components/      # React components (shadcn/ui)
│   │   ├── hooks/           # Custom React hooks
│   │   └── lib/             # Utilities and configurations
│   └── package.json
├── backend/                  # Express.js backend API
│   ├── src/
│   │   ├── controllers/     # API route handlers
│   │   ├── services/        # Business logic services
│   │   ├── database/        # Database migrations and types
│   │   └── middleware/      # Express middleware
│   └── package.json
├── contracts/                # Solidity smart contracts
│   ├── src/                 # Contract source files
│   ├── test/                # Contract tests
│   ├── script/              # Deployment scripts
│   └── foundry.toml         # Foundry configuration
└── package.json             # Root workspace configuration
```

## 🔗 Smart Contracts

The project includes Solidity smart contracts for on-chain voting:

- **BattleVoting.sol**: Main voting contract for battle management
- **Deployment Scripts**: Automated contract deployment
- **Tests**: Comprehensive test coverage for smart contracts

To work with contracts:
```bash
cd contracts
forge build    # Compile contracts
forge test     # Run tests
forge script   # Deploy contracts
```

## 🔒 Security & Environment Setup

### Environment Variables
- **Never commit `.env` files** - they contain sensitive API keys and secrets
- **Use `.env.example` files** as templates for required environment variables
- **All `.env*` files are automatically ignored** by git (see `.gitignore`)

### Required Environment Files
1. **Backend**: Copy `backend/env.example` to `backend/.env`
2. **Frontend**: Copy `frontend/.env.local.example` to `frontend/.env.local`
3. **Contracts**: Copy `contracts/env.example` to `contracts/.env`

### Security Checklist
- ✅ No hardcoded API keys or secrets in source code
- ✅ All `.env` files properly ignored by git
- ✅ Environment examples provided for all services
- ✅ No sensitive files tracked in repository
- ✅ Proper `.gitignore` configuration

### Before Pushing to GitHub
1. Ensure all `.env` files are created locally (not committed)
2. Verify no sensitive data is in tracked files
3. Test that the application works with your environment variables
4. Review the security checklist above

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/mertkaradayi/Monad-Realtime-AI-Art-Battles-with-On-Chain-Voting.git
   cd Monad-Realtime-AI-Art-Battles-with-On-Chain-Voting
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   - Copy `backend/env.example` to `backend/.env`
   - Copy `frontend/.env.local.example` to `frontend/.env.local`
   - Fill in your API keys and configuration

4. **Start development servers**
   ```bash
   npm run dev:backend   # Terminal 1
   npm run dev:frontend  # Terminal 2
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for the Monad Hackathon
- Uses FAL.ai for AI art generation
- Powered by Supabase for real-time database
- Smart contracts built with Foundry
