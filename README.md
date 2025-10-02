# Battle Semantic

AI-powered semantic battle application built with Next.js, TypeScript, Supabase, and Privy authentication.

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
- **Backend**: Express.js + TypeScript + Supabase + Privy Auth
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Privy (MetaMask wallet integration)
- **Development**: Monorepo with npm workspaces

## Scripts

```bash
npm run dev:frontend  # Start frontend
npm run dev:backend   # Start backend
npm run dev:watch     # Frontend with auto-restart
npm run build         # Build both
npm run install:all   # Install all dependencies
```

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

# Server Configuration
PORT=3001
NODE_ENV=development
```

**Frontend (.env.local):**
```env
# Privy Configuration
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id_here
```

> **Note**: See the [complete setup guide](./docs/PROJECT_SETUP.md) for detailed configuration instructions.