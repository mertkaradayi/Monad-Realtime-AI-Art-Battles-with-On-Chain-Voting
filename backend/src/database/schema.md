# Database Schema

## Current Schema (as of 2024-12-01)

### Messages Table
- **id**: UUID (Primary Key, Auto-generated with `gen_random_uuid()`)
- **content**: TEXT (Required, NOT NULL)
- **author**: VARCHAR(100) (Default: 'Anonymous', Nullable)
- **created_at**: TIMESTAMPTZ (Auto-generated with `NOW()`, Nullable)
- **updated_at**: TIMESTAMPTZ (Auto-generated with `NOW()`, Nullable)
- **original_content**: TEXT (Optional, Nullable, "Original message content before enhancement")
- **enhancement_data**: JSONB (Optional, Nullable, "JSON data containing enhancement details (type, confidence, improvements, etc.)")

### Indexes
- **idx_messages_created_at**: Index on `created_at` column for better query performance

### Security
- **Row Level Security (RLS)**: Enabled on messages table
- **Policy**: "Allow all operations on messages" (FOR ALL USING (true) WITH CHECK (true))

### Triggers
- **update_messages_updated_at**: Automatically updates `updated_at` timestamp on row updates

## Schema History

### 2024-12-01 - Initial Setup
- Created messages table with basic columns (id, content, author, created_at, updated_at)
- Added RLS and basic policy
- Created update trigger for updated_at column

### 2024-12-01 - Enhancement Features
- Added `original_content` column for storing original message content before enhancement
- Added `enhancement_data` column for storing JSON data with enhancement details
- Both columns are nullable to maintain backward compatibility

## Notes
- This schema is managed via Supabase MCP tools
- All changes should be made through MCP migrations, not manual SQL editing
- TypeScript types are generated automatically from this schema
- The `enhancement_data` column can store structured JSON for various enhancement types

