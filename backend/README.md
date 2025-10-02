# Battle Semantic Backend

This is the backend server for the Battle Semantic application, built with TypeScript, Express.js and Supabase.

## Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Configuration:**
   - Copy `env.example` to `.env`
   - Fill in your Supabase credentials:
     ```env
     SUPABASE_URL=your_supabase_project_url
     SUPABASE_ANON_KEY=your_supabase_anon_key
     SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
     PORT=3001
     NODE_ENV=development
     ```

3. **Get Supabase Credentials:**
   - Go to your Supabase project dashboard
   - Navigate to Settings > API
   - Copy the Project URL and anon/public key
   - For service role key, copy the service_role key (keep this secret!)

## Running the Server

- **Development mode (with hot reload):**
  ```bash
  npm run dev
  ```

- **Build and run production:**
  ```bash
  npm run build
  npm start
  ```

- **Type checking:**
  ```bash
  npm run type-check
  ```

## API Endpoints

- `GET /health` - Health check
- `GET /test-supabase` - Test Supabase connection
- `GET /api` - API information

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── supabase.ts    # Supabase client configuration
│   └── index.ts           # Main server file
├── dist/                  # Compiled JavaScript (generated)
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── env.example            # Environment variables template
└── README.md             # This file
```

## Features

- ✅ TypeScript for type safety
- ✅ Express.js server with CORS
- ✅ Supabase integration with both client and admin clients
- ✅ Environment variable configuration
- ✅ Error handling middleware
- ✅ Hot reload in development
- ✅ Type checking

## Next Steps

1. Set up your Supabase project
2. Configure environment variables
3. Test the connection
4. Start building your API endpoints!
