# Battle Semantic

AI-powered semantic battle application with automated database management, built with Next.js, TypeScript, Supabase MCP, and Privy authentication.

## 🚀 Quick Start

```bash
# Install dependencies
npm run install:all

# Follow the complete setup guide
# See docs/PROJECT_SETUP.md for detailed instructions

# Start development
npm run dev:backend  # Terminal 1
npm run dev:frontend # Terminal 2
```

**Access:**
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## 📚 Documentation

Comprehensive documentation is available in the [`docs/`](./docs/) directory:

- **[Complete Setup Guide](./docs/PROJECT_SETUP.md)** - Full project setup from scratch
- **[Privy Authentication](./docs/PRIVY_SETUP.md)** - Wallet authentication setup
- **[Supabase Database](./docs/SUPABASE_SETUP.md)** - Database configuration
- **[API Documentation](./docs/API_DOCUMENTATION.md)** - Complete API reference
- **[Troubleshooting](./docs/TROUBLESHOOTING.md)** - Common issues and solutions

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 + React 19 + Tailwind CSS + shadcn/ui
- **Backend**: Express.js + TypeScript + Supabase MCP + Privy Auth
- **Database**: PostgreSQL (via Supabase) with AI-driven schema management
- **Authentication**: Privy (MetaMask wallet integration)
- **Development**: Monorepo with npm workspaces

## Scripts

```bash
# Development
npm run dev:frontend  # Start frontend
npm run dev:backend   # Start backend
npm run dev:watch     # Frontend with auto-restart

# Building
npm run build         # Build both frontend and backend
npm run build:frontend # Build frontend only
npm run build:backend  # Build backend only

# Testing
npm run test          # Run all backend tests
npm run test:fal      # Test FAL.ai integration
npm run test:message  # Test message enhancement
npm run test:demo     # Test message demo
npm run test:watch    # Run tests in watch mode

# Utilities
npm run install:all   # Install all dependencies
npm run type-check    # TypeScript type checking
npm run lint          # Lint frontend code
```

## 🎯 Key Features

- **AI-Driven Database Management**: Schema changes via Supabase MCP tools
- **Automated TypeScript Types**: Auto-generated from database schema
- **Wallet Authentication**: MetaMask integration via Privy
- **Modern UI**: shadcn/ui components with Tailwind CSS
- **Type-Safe**: Full TypeScript implementation
- **Real-time Database**: Supabase PostgreSQL with RLS

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

> **Note**: See the [complete setup guide](./docs/PROJECT_SETUP.md) for detailed configuration instructions.

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
