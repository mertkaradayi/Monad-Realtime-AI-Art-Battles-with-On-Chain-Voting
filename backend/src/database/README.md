# Database Management

This directory contains the database schema and migration management for the Battle Semantic project.

## 🎯 **MCP-First Approach**

**IMPORTANT**: All database schema changes must be made through Supabase MCP tools, not by editing files directly.

## Directory Structure

```
database/
├── schema.md              # Human-readable current schema documentation
├── types/
│   └── database.ts        # Generated TypeScript types from current schema
├── migrations/            # Applied migration history (for reference only)
│   ├── 001_initial_messages_table.sql
│   ├── 002_add_original_content_column.sql
│   └── 003_add_enhancement_data_column.sql
└── README.md              # This file
```

## How to Make Schema Changes

### ✅ **Correct Way (MCP)**
1. Use Supabase MCP tools to read current schema
2. Apply changes via `mcp_supabase_apply_migration`
3. Update `schema.md` documentation
4. Regenerate TypeScript types
5. Create migration file for history

### ❌ **Incorrect Way**
- Editing SQL files directly
- Making changes in Supabase Studio UI
- Manual database modifications

## AI Commands

You can ask the AI to:

```
"Add a 'category' column to messages table with VARCHAR(50) type"
"Create a new 'users' table with wallet_address and created_at columns"
"Add an index on the 'author' column for better performance"
"Generate TypeScript types for the current schema"
"Show me the current messages table schema"
```

## Files

### `schema.md`
Human-readable documentation of the current database schema. Updated automatically when changes are made via MCP.

### `types/database.ts`
Generated TypeScript types from the current Supabase schema. Includes:
- `Message` - Row type for messages table
- `MessageInsert` - Insert type for messages table  
- `MessageUpdate` - Update type for messages table
- `EnhancementData` - Interface for enhancement_data JSON structure

### `migrations/`
Historical record of applied migrations. These files are created for reference and version control, but should not be edited manually.

## Project ID

Current Supabase project: `hhlponznilkvphidgkat`

## Security

- Row Level Security (RLS) is enabled on all tables
- All schema changes are tracked and version controlled
- TypeScript types ensure type safety in the application

