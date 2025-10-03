# Database Schema

## Current Schema (as of 2024-12-01)

### Battles Table
- **id**: UUID (Primary Key, Auto-generated with `gen_random_uuid()`)
- **concept**: TEXT (Required, NOT NULL, "LLM-generated battle concept/theme")
- **status**: battle_status ENUM (Default: 'waiting', Values: waiting, active, voting, completed, cancelled)
- **created_at**: TIMESTAMPTZ (Auto-generated with `NOW()`, Nullable)
- **updated_at**: TIMESTAMPTZ (Auto-generated with `NOW()`, Nullable)
- **joining_qr_data**: TEXT (Optional, Nullable, "QR code data for battle joining")
- **voting_qr_data**: TEXT (Optional, Nullable, "QR code data for voting")
- **creator_wallet**: VARCHAR(100) (Optional, Nullable, "Wallet address of battle creator")
- **participant1_wallet**: VARCHAR(100) (Optional, Nullable, "Wallet address of first participant")
- **participant2_wallet**: VARCHAR(100) (Optional, Nullable, "Wallet address of second participant")
- **total_votes**: INTEGER (Default: 0, "Total number of votes cast")
- **winner_wallet**: VARCHAR(100) (Optional, Nullable, "Wallet address of winner")
- **completed_at**: TIMESTAMPTZ (Optional, Nullable, "When battle was completed")

### Messages Table (Legacy)
- **id**: UUID (Primary Key, Auto-generated with `gen_random_uuid()`)
- **content**: TEXT (Required, NOT NULL)
- **author**: VARCHAR(100) (Default: 'Anonymous', Nullable)
- **created_at**: TIMESTAMPTZ (Auto-generated with `NOW()`, Nullable)
- **updated_at**: TIMESTAMPTZ (Auto-generated with `NOW()`, Nullable)
- **original_content**: TEXT (Optional, Nullable, "Original message content before enhancement")
- **enhancement_data**: JSONB (Optional, Nullable, "JSON data containing enhancement details (type, confidence, improvements, etc.)")

### Indexes
- **idx_battles_status**: Index on `status` column for better query performance
- **idx_battles_created_at**: Index on `created_at` column for better query performance
- **idx_messages_created_at**: Index on `created_at` column for better query performance (legacy)

### Security
- **Row Level Security (RLS)**: Enabled on both battles and messages tables
- **Battles Table Policies**: 
  - "Service role can manage battles" - Backend service role can perform all operations (bypasses RLS)
  - "Users can view all battles" - Anyone can view battles (for public battles)
  - "Users can create battles" - Anyone can create battles
  - "Users can update battles" - Anyone can update battles (for joining/voting)
- **Messages Table Policies (Legacy)**: 
  - "Service role can manage messages" - Backend service role can perform all operations (bypasses RLS)
  - "Users can view own messages" - Authenticated users can only SELECT messages where author matches their user ID
  - "Users can insert own messages" - Authenticated users can only INSERT messages with their own user ID as author
  - "Users can update own messages" - Authenticated users can only UPDATE their own messages
  - "Users can delete own messages" - Authenticated users can only DELETE their own messages
- **Backend Authentication**: Uses Privy for user authentication and service role for database operations
- **User Isolation**: Backend filters all operations by wallet address extracted from Privy authentication

### Triggers
- **update_battles_updated_at**: Automatically updates `updated_at` timestamp on battles table updates
- **update_messages_updated_at**: Automatically updates `updated_at` timestamp on messages table updates (legacy)

## Schema History

### 2024-12-01 - Initial Setup
- Created messages table with basic columns (id, content, author, created_at, updated_at)
- Added RLS and basic policy
- Created update trigger for updated_at column

### 2024-12-01 - Enhancement Features
- Added `original_content` column for storing original message content before enhancement
- Added `enhancement_data` column for storing JSON data with enhancement details
- Both columns are nullable to maintain backward compatibility

### 2024-12-01 - Security Improvements
- Replaced overly permissive RLS policy with proper ownership-based policies
- Users can now only access their own messages (based on wallet address)
- Added separate policies for SELECT, INSERT, UPDATE, and DELETE operations

### 2024-12-01 - Backend Integration Fix
- Updated RLS policies to work with backend service role authentication
- Backend now uses `supabaseAdmin` client with service role key to bypass RLS
- User isolation maintained through backend filtering by wallet address
- Fixed "new row violates row-level security policy" error

### 2024-12-01 - Battle System Implementation
- Created battles table with battle concept system
- Added battle_status enum (waiting, active, voting, completed, cancelled)
- Added QR code fields for joining and voting
- Added participant wallet tracking
- Added vote counting and winner tracking
- Set up RLS policies for public battle access

## Notes
- This schema is managed via Supabase MCP tools
- All changes should be made through MCP migrations, not manual SQL editing
- TypeScript types are generated automatically from this schema
- The `enhancement_data` column can store structured JSON for various enhancement types

