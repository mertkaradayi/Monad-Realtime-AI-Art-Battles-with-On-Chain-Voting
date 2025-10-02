# Supabase Setup Instructions

This project demonstrates a simple Supabase integration with a Next.js frontend and Express backend.

## Prerequisites

1. A Supabase project (create one at [supabase.com](https://supabase.com))
2. Node.js installed

## Setup Steps

### 1. Create the Database Table

Run this SQL in your Supabase SQL Editor:

```sql
-- Create a simple messages table for testing Supabase integration
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    author VARCHAR(100) DEFAULT 'Anonymous',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on created_at for better query performance
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for now (for testing purposes)
-- In production, you would want more restrictive policies
CREATE POLICY "Allow all operations on messages" ON messages
    FOR ALL USING (true) WITH CHECK (true);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_messages_updated_at 
    BEFORE UPDATE ON messages 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

### 2. Backend Environment Setup

1. Copy `backend/env.example` to `backend/.env`
2. Fill in your Supabase credentials:
   ```
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   PORT=3001
   NODE_ENV=development
   ```

### 3. Frontend Environment Setup

1. Create `frontend/.env.local` with:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### 4. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 5. Run the Application

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 6. Test the Application

1. Open http://localhost:3000 in your browser
2. Add a message using the form
3. Edit and delete messages
4. Check your Supabase dashboard to see the data being stored

## How It Works

1. **Frontend** (Next.js): Sends HTTP requests to the backend API
2. **Backend** (Express): Uses Supabase client to interact with PostgreSQL database
3. **Database** (Supabase): Stores the messages with automatic timestamps and UUIDs

## API Endpoints

- `GET /api/messages` - Get all messages
- `POST /api/messages` - Create a new message
- `PUT /api/messages/:id` - Update a message
- `DELETE /api/messages/:id` - Delete a message

## Next Steps

- Add authentication with Supabase Auth
- Implement real-time updates with Supabase subscriptions
- Add more complex data relationships
- Implement proper error handling and validation
