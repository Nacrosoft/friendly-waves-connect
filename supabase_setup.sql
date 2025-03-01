-- Users Table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  password TEXT NOT NULL,
  avatar TEXT,
  status TEXT DEFAULT 'offline',
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversations Table
CREATE TABLE conversations (
  id TEXT PRIMARY KEY,
  last_message_text TEXT,
  last_message_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unread_count INTEGER DEFAULT 0
);

-- Conversation Participants Table
CREATE TABLE conversation_participants (
  conversation_id TEXT REFERENCES conversations(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (conversation_id, user_id)
);

-- Messages Table
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  text TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE,
  type TEXT DEFAULT 'text',
  reply_to_id TEXT,
  attachment_url TEXT,
  edited BOOLEAN DEFAULT FALSE,
  deleted BOOLEAN DEFAULT FALSE
);

-- Reactions Table
CREATE TABLE reactions (
  id SERIAL PRIMARY KEY,
  message_id TEXT REFERENCES messages(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  is_custom BOOLEAN DEFAULT FALSE,
  custom_emoji_id TEXT
);

-- Custom Emojis Table
CREATE TABLE custom_emojis (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL
);

-- Calls Table
CREATE TABLE calls (
  id TEXT PRIMARY KEY,
  caller_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  recipient_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  is_video BOOLEAN DEFAULT FALSE
);

-- Add indexes for performance
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_reactions_message_id ON reactions(message_id);
CREATE INDEX idx_custom_emojis_user_id ON custom_emojis(user_id);
CREATE INDEX idx_conversations_last_message_time ON conversations(last_message_time DESC);

-- Add indexes for calls
CREATE INDEX idx_calls_caller_id ON calls(caller_id);
CREATE INDEX idx_calls_recipient_id ON calls(recipient_id);
CREATE INDEX idx_calls_status ON calls(status);
