# Database Schema

## Current Schema (as of 2024-12-01)

### Battles Table
- **id**: UUID (Primary Key, Auto-generated with `gen_random_uuid()`)
- **concept**: TEXT (Required, NOT NULL, "LLM-generated battle concept/theme")
- **status**: battle_status ENUM (Default: 'waiting', Values: waiting, active, voting, completed, cancelled, prompts_submitted)
- **created_at**: TIMESTAMPTZ (Auto-generated with `NOW()`, Nullable)
- **updated_at**: TIMESTAMPTZ (Auto-generated with `NOW()`, Nullable)
- **joining_qr_data**: TEXT (Optional, Nullable, "QR code data for battle joining")
- **voting_qr_data**: TEXT (Optional, Nullable, "QR code data for voting")
- **creator_wallet**: VARCHAR(100) (Optional, Nullable, "Wallet address of battle creator")
- **participant1_wallet**: VARCHAR(100) (Optional, Nullable, "Wallet address of first participant")
- **participant2_wallet**: VARCHAR(100) (Optional, Nullable, "Wallet address of second participant")
- **participant1_prompt**: TEXT (Optional, Nullable, "Full prompt submitted by first participant (concept + completion)")
- **participant2_prompt**: TEXT (Optional, Nullable, "Full prompt submitted by second participant (concept + completion)")
- **total_votes**: INTEGER (Default: 0, "Total number of votes cast")
- **winner_wallet**: VARCHAR(100) (Optional, Nullable, "Wallet address of winner")
- **completed_at**: TIMESTAMPTZ (Optional, Nullable, "When battle was completed")

### Messages Table (Removed)
- **Status**: Successfully removed from database
- **Date Removed**: January 3, 2025
- **Reason**: Legacy table from original message enhancement project, not used in AI Art Battles system

### Indexes
- **idx_battles_status**: Index on `status` column for better query performance
- **idx_battles_created_at**: Index on `created_at` column for better query performance
- **idx_unique_participant1_active**: Unique index on `participant1_wallet` for active battles (prevents duplicate participants)
- **idx_unique_participant2_active**: Unique index on `participant2_wallet` for active battles (prevents duplicate participants)

### Security
- **Row Level Security (RLS)**: Enabled on battles table
- **Battles Table Policies**: 
  - "Service role can manage battles" - Backend service role can perform all operations (bypasses RLS)
  - "Users can view all battles" - Anyone can view battles (for public battles)
  - "Users can create battles" - Anyone can create battles
  - "Users can update battles" - Anyone can update battles (for joining/voting)
- **Backend Authentication**: Uses Privy for user authentication and service role for database operations
- **User Isolation**: Backend filters all operations by wallet address extracted from Privy authentication

### Triggers
- **update_battles_updated_at**: Automatically updates `updated_at` timestamp on battles table updates

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

### 2025-01-03 - Legacy Cleanup
- Removed messages table and all related objects (indexes, triggers, policies)
- Updated TypeScript types to reflect current schema
- Cleaned up database schema documentation
- Aligned database with AI Art Battles system implementation

### 2025-01-03 - Race Condition Prevention
- Added unique constraints to prevent duplicate participants across battles
- Added check constraint to prevent same wallet in both participant slots
- Implemented atomic database operations for battle joining
- Ensures only the first 2 users can participate in each battle

### 2025-01-03 - Prompt Submission Feature
- Added participant1_prompt and participant2_prompt columns to battles table
- These fields store the complete prompts (concept + user completion) for each participant
- Added 'prompts_submitted' status to battle_status enum
- Implemented prompt submission API endpoint (POST /api/battles/:id/submit-prompt)
- Added frontend UI for prompt submission with large textarea and confirmation
- Enables prompt submission workflow for AI art battle system
- Battle status automatically updates to 'prompts_submitted' when both participants submit prompts

## Notes
- This schema is managed via Supabase MCP tools
- All changes should be made through MCP migrations, not manual SQL editing
- TypeScript types are generated automatically from this schema
- The `enhancement_data` column can store structured JSON for various enhancement types

