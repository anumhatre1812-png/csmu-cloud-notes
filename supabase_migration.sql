-- ============================================================
-- CSMU Cloud Notes — Supabase SQL Migration
-- Run this SQL in the Supabase SQL Editor
-- Applies to: Realtime updates, Email/Password auth support
-- ============================================================

-- 1. Enable Realtime on tables that need it
-- This allows the frontend to subscribe to live changes

ALTER PUBLICATION supabase_realtime ADD TABLE files;
ALTER PUBLICATION supabase_realtime ADD TABLE announcements;

-- 2. Ensure the files table has RLS policies for Realtime
-- (Realtime subscriptions respect RLS — authenticated users need SELECT)

-- Verify RLS is enabled on the files table
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists, then recreate
DROP POLICY IF EXISTS "Authenticated users can view files" ON files;
CREATE POLICY "Authenticated users can view files"
  ON files FOR SELECT
  USING (auth.role() = 'authenticated');

-- 3. Ensure announcements table has RLS for Realtime
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view announcements" ON announcements;
CREATE POLICY "Authenticated users can view announcements"
  ON announcements FOR SELECT
  USING (auth.role() = 'authenticated');

-- 4. Ensure bookmarks table has RLS
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own bookmarks" ON bookmarks;
CREATE POLICY "Users can view own bookmarks"
  ON bookmarks FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own bookmarks" ON bookmarks;
CREATE POLICY "Users can insert own bookmarks"
  ON bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own bookmarks" ON bookmarks;
CREATE POLICY "Users can delete own bookmarks"
  ON bookmarks FOR DELETE
  USING (auth.uid() = user_id);

-- 5. Ensure download_history table has RLS
ALTER TABLE download_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own downloads" ON download_history;
CREATE POLICY "Users can view own downloads"
  ON download_history FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own downloads" ON download_history;
CREATE POLICY "Users can insert own downloads"
  ON download_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- IMPORTANT: After running this SQL, you must also:
-- 1. Go to Supabase Dashboard → Database → Replication
--    → Ensure "files" and "announcements" tables are listed
--      under "supabase_realtime" publication
-- 2. Enable Email/Password sign-in in Firebase Console:
--    Firebase Console → Authentication → Sign-in method
--    → Enable "Email/Password" provider
-- ============================================================
