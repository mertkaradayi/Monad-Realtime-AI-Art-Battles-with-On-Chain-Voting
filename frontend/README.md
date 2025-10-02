# Frontend

Next.js 15 frontend with React 19, Tailwind CSS, and shadcn/ui.

## Quick Start

```bash
# From root directory
npm run dev:frontend

# Or from frontend directory
cd frontend && npm run dev
```

**Access:** http://localhost:3000

## Tech Stack

- Next.js 15 + React 19 + TypeScript
- Tailwind CSS 4 + shadcn/ui
- Lucide React icons

## Scripts

```bash
npm run dev     # Start with Turbopack
npm run build   # Build for production
npm start      # Start production server
npm run lint   # Run ESLint
```

## Adding Components

```bash
npx shadcn@latest add [component-name]
```

## Environment Variables

Create `.env.local` for frontend config:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=Battle Semantic
```
