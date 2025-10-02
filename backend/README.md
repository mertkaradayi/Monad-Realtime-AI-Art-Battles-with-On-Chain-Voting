# Backend

Express.js backend with TypeScript and Supabase.

## Quick Start

```bash
# From root directory
npm run dev:backend

# Or from backend directory
cd backend && npm run dev
```

**Access:** http://localhost:3001

## Setup

```bash
cd backend
cp env.example .env
# Edit .env with your Supabase credentials
```

## Environment Variables

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
PORT=3001
NODE_ENV=development
```

## Scripts

```bash
npm run dev          # Start with hot reload
npm run build        # Build TypeScript
npm start           # Start production server
npm run type-check  # Type checking only
```

## API Endpoints

- `GET /health` - Health check
- `GET /test-supabase` - Test Supabase connection
- `GET /api` - API information
