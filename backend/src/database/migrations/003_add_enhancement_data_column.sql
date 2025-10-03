-- Add enhancement_data column to messages table
-- Applied: 2024-12-01
-- Description: Added JSONB column to store enhancement details and metadata

ALTER TABLE messages 
ADD COLUMN enhancement_data JSONB;

COMMENT ON COLUMN messages.enhancement_data IS 'JSON data containing enhancement details (type, confidence, improvements, etc.)';

