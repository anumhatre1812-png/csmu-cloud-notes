import { Response } from 'express';
import { AuthRequest } from '../middleware/verifyFirebaseToken.js';
import { supabase } from '../config/supabase.js';

export const listBookmarks = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.uid;
    const { data, error } = await supabase
      .from('bookmarks')
      .select('*, files(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json({ success: true, bookmarks: data });
  } catch (error: any) {
    console.error('List bookmarks error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const addBookmark = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.uid;
    const { file_id } = req.body;

    if (!file_id) {
      return res.status(400).json({ error: 'file_id is required' });
    }

    const { data: existing } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('user_id', userId)
      .eq('file_id', file_id)
      .maybeSingle();

    if (existing) {
      return res.status(200).json({ success: true, bookmark: existing });
    }

    const { data, error } = await supabase
      .from('bookmarks')
      .insert({ user_id: userId, file_id })
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({ success: true, bookmark: data });
  } catch (error: any) {
    console.error('Add bookmark error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const removeBookmark = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.uid;
    const { id } = req.params;

    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Remove bookmark error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
