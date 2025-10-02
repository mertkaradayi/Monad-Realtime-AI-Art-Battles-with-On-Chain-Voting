# Supabase Setup Guide

This guide will help you set up Supabase for the Battle Semantic project, including database configuration, authentication, and API setup.

## Prerequisites

- A Supabase account (free tier available)
- Node.js and npm installed
- Basic understanding of PostgreSQL

## 1. Create a Supabase Project

### Step 1: Sign Up/Login
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Sign up for a free account or login if you already have one
3. Click "New Project"

### Step 2: Project Configuration
1. **Organization**: Select your organization (or create one)
2. **Name**: `battle-semantic` (or your preferred name)
3. **Database Password**: Create a strong password (save this!)
4. **Region**: Choose the closest region to your users
5. **Pricing Plan**: Select "Free" for development

### Step 3: Wait for Setup
- Project creation takes 1-2 minutes
- You'll see a progress indicator
- Don't close the browser tab during setup

## 2. Database Setup

### Step 1: Access the SQL Editor
1. In your Supabase dashboard, go to the "SQL Editor" tab
2. Click "New Query"

### Step 2: Create the Messages Table
Run the following SQL to create the messages table:

```sql
-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  author TEXT NOT NULL DEFAULT 'Anonymous',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on created_at for better query performance
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for authenticated users
-- Note: This is a basic setup - you may want to restrict this further
CREATE POLICY "Allow all operations for authenticated users" ON messages
  FOR ALL USING (auth.role() = 'authenticated');
```

### Step 3: Verify Table Creation
1. Go to "Table Editor" in your Supabase dashboard
2. You should see the `messages` table
3. The table should have columns: `id`, `content`, `author`, `created_at`, `updated_at`

## 3. API Configuration

### Step 1: Get Your Project Credentials
1. In your Supabase dashboard, go to "Settings" → "API"
2. Copy the following values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **Anon/Public Key** (starts with `eyJ...`)
   - **Service Role Key** (starts with `eyJ...`) - Keep this secret!

### Step 2: Configure Environment Variables

#### Backend Configuration
Create a `.env` file in the `backend` directory:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Privy Configuration
PRIVY_APP_ID=your-privy-app-id
PRIVY_APP_SECRET=your-privy-app-secret

# Server Configuration
PORT=3001
NODE_ENV=development
```

#### Frontend Configuration
Create a `.env.local` file in the `frontend` directory:

```bash
# Privy Configuration
NEXT_PUBLIC_PRIVY_APP_ID=your-privy-app-id-here

# Supabase Configuration (if needed for direct client access)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## 4. Test the Connection

### Step 1: Start the Backend
```bash
cd backend
npm install
npm run dev
```

### Step 2: Test the Supabase Connection
Visit: `http://localhost:3001/test-supabase`

You should see a response indicating successful connection.

### Step 3: Test the Messages API
```bash
# Test with authentication (you'll need a valid token)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/messages
```

## 5. Database Management

### Using the Supabase Dashboard
1. **Table Editor**: View and edit data directly
2. **SQL Editor**: Run custom queries
3. **Database**: View database structure and relationships
4. **Logs**: Monitor database activity

### Common SQL Queries

```sql
-- View all messages
SELECT * FROM messages ORDER BY created_at DESC;

-- Count total messages
SELECT COUNT(*) FROM messages;

-- View messages by author
SELECT * FROM messages WHERE author = '0x123...' ORDER BY created_at DESC;

-- Delete old messages (older than 30 days)
DELETE FROM messages WHERE created_at < NOW() - INTERVAL '30 days';
```

## 6. Security Best Practices

### Row Level Security (RLS)
The messages table has RLS enabled. You can create more specific policies:

```sql
-- Example: Users can only see their own messages
CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT USING (auth.uid()::text = author);

-- Example: Users can only update their own messages
CREATE POLICY "Users can update own messages" ON messages
  FOR UPDATE USING (auth.uid()::text = author);
```

### API Key Security
- **Never commit** your `.env` files to version control
- **Use different keys** for development and production
- **Rotate keys** regularly in production
- **Use the anon key** for client-side operations
- **Use the service role key** only on the server

## 7. Production Considerations

### Database Optimization
```sql
-- Add indexes for better performance
CREATE INDEX idx_messages_author ON messages(author);
CREATE INDEX idx_messages_content_search ON messages USING gin(to_tsvector('english', content));
```

### Backup Strategy
1. Enable automatic backups in Supabase dashboard
2. Set up point-in-time recovery
3. Export data regularly for additional backup

### Monitoring
1. Set up database monitoring in Supabase
2. Monitor API usage and limits
3. Set up alerts for unusual activity

## 8. Troubleshooting

### Common Issues

#### Connection Errors
- **Check your URL**: Ensure it includes `https://` and ends with `.supabase.co`
- **Verify API keys**: Make sure they're copied correctly
- **Check network**: Ensure your server can reach Supabase

#### Authentication Issues
- **Verify RLS policies**: Check if your policies allow the operation
- **Check user permissions**: Ensure the user has the right role
- **Validate tokens**: Make sure authentication tokens are valid

#### Performance Issues
- **Add indexes**: Create indexes on frequently queried columns
- **Optimize queries**: Use `EXPLAIN` to analyze query performance
- **Monitor usage**: Check your Supabase dashboard for usage metrics

### Getting Help
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Community](https://github.com/supabase/supabase/discussions)
- [Supabase Discord](https://discord.supabase.com/)

## 9. Next Steps

1. **Set up authentication** with Privy (see `PRIVY_SETUP.md`)
2. **Configure CORS** for your frontend domain
3. **Set up real-time subscriptions** if needed
4. **Implement data validation** on the backend
5. **Add error handling** and logging
6. **Set up monitoring** and alerts

## 10. Useful Commands

```bash
# Install Supabase CLI (optional)
npm install -g supabase

# Login to Supabase CLI
supabase login

# Link to your project
supabase link --project-ref your-project-id

# Generate TypeScript types
supabase gen types typescript --project-id your-project-id > types/supabase.ts
```

---

**Note**: This setup is for development. For production, ensure you follow all security best practices and configure proper monitoring and backup strategies.
