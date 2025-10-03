-- Add original_content column to messages table
-- Applied: 2024-12-01
-- Description: Added column to store original message content before enhancement

ALTER TABLE messages 
ADD COLUMN original_content TEXT;

COMMENT ON COLUMN messages.original_content IS 'Original message content before enhancement';

