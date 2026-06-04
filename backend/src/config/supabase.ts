import { createClient } from '@supabase/supabase-js';
import type { WebSocketLikeConstructor } from '@supabase/realtime-js';
import WebSocket from 'ws';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').replace(/\s/g, '');

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  realtime: {
    transport: WebSocket as unknown as WebSocketLikeConstructor
  }
});
