-- ============================================================
-- CSMU Cloud Notes — Complete Supabase SQL Schema
-- Run this in Supabase SQL Editor (Ctrl+Enter to execute all)
-- ============================================================

-- 1. files
CREATE TABLE IF NOT EXISTS files (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         VARCHAR(160) NOT NULL,
  category      VARCHAR(50) NOT NULL CHECK (category IN ('notes','assignments','lab-manuals','question-papers','question-bank')),
  subject       VARCHAR(120),
  file_url      TEXT NOT NULL,
  storage_path  TEXT NOT NULL,
  file_type     VARCHAR(100) NOT NULL,
  file_size     BIGINT NOT NULL,
  uploader_name VARCHAR(255),
  uploader_email VARCHAR(255),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_files_created_at ON files (created_at DESC);

-- 2. bookmarks
CREATE TABLE IF NOT EXISTS bookmarks (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    VARCHAR(128) NOT NULL,
  file_id    UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, file_id)
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks (user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_created_at ON bookmarks (created_at DESC);

-- 3. download_history
CREATE TABLE IF NOT EXISTS download_history (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        VARCHAR(128) NOT NULL,
  file_id        UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  file_title     VARCHAR(160),
  file_category  VARCHAR(50),
  file_size      BIGINT,
  downloaded_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_download_history_user_id ON download_history (user_id);
CREATE INDEX IF NOT EXISTS idx_download_history_downloaded_at ON download_history (downloaded_at DESC);

-- 4. announcements
CREATE TABLE IF NOT EXISTS announcements (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title      VARCHAR(200) NOT NULL,
  content    TEXT NOT NULL,
  created_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements (created_at DESC);

-- 5. admin_actions (audit log)
CREATE TABLE IF NOT EXISTS admin_actions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_email VARCHAR(255) NOT NULL,
  action      VARCHAR(20) NOT NULL CHECK (action IN ('upload', 'edit', 'delete')),
  file_id     UUID,
  file_title  VARCHAR(160),
  metadata    JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON admin_actions (created_at DESC);

-- 6. push_tokens
CREATE TABLE IF NOT EXISTS push_tokens (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    VARCHAR(128) NOT NULL,
  token      TEXT NOT NULL,
  platform   VARCHAR(20) NOT NULL DEFAULT 'web' CHECK (platform IN ('web', 'android', 'ios')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ,
  UNIQUE (user_id, platform)
);

-- ============================================================
-- RLS Policies
-- ============================================================

-- files
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can view files" ON files;
CREATE POLICY "Authenticated users can view files"
  ON files FOR SELECT USING (auth.role() = 'authenticated');

-- announcements
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can view announcements" ON announcements;
CREATE POLICY "Authenticated users can view announcements"
  ON announcements FOR SELECT USING (auth.role() = 'authenticated');

-- bookmarks
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own bookmarks" ON bookmarks;
CREATE POLICY "Users can view own bookmarks"
  ON bookmarks FOR SELECT USING (auth.uid()::text = user_id);
DROP POLICY IF EXISTS "Users can insert own bookmarks" ON bookmarks;
CREATE POLICY "Users can insert own bookmarks"
  ON bookmarks FOR INSERT WITH CHECK (auth.uid()::text = user_id);
DROP POLICY IF EXISTS "Users can delete own bookmarks" ON bookmarks;
CREATE POLICY "Users can delete own bookmarks"
  ON bookmarks FOR DELETE USING (auth.uid()::text = user_id);

-- download_history
ALTER TABLE download_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own downloads" ON download_history;
CREATE POLICY "Users can view own downloads"
  ON download_history FOR SELECT USING (auth.uid()::text = user_id);
DROP POLICY IF EXISTS "Users can insert own downloads" ON download_history;
CREATE POLICY "Users can insert own downloads"
  ON download_history FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- push_tokens
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own tokens" ON push_tokens;
CREATE POLICY "Users can manage own tokens"
  ON push_tokens FOR ALL USING (auth.uid()::text = user_id);

-- ============================================================
-- Enable Realtime
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE files;
ALTER PUBLICATION supabase_realtime ADD TABLE announcements;
