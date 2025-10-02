# Battle Semantic

AI-powered semantic battle application built with Next.js, TypeScript, and Supabase.

## Quick Start

```bash
# Install dependencies
npm run install:all

# Setup backend
cd backend && cp env.example .env
# Edit .env with your Supabase credentials

# Start development
npm run dev:backend  # Terminal 1
npm run dev:frontend # Terminal 2
```

**Access:**
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## Tech Stack

- **Frontend**: Next.js 15 + React 19 + Tailwind CSS + shadcn/ui
- **Backend**: Express.js + TypeScript + Supabase
- **Development**: Monorepo with npm workspaces

## Scripts

```bash
npm run dev:frontend  # Start frontend
npm run dev:backend   # Start backend
npm run dev:watch     # Frontend with auto-restart
npm run build         # Build both
npm run install:all   # Install all dependencies
```

## Environment Variables

**Backend (.env):**
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
PORT=3001
```