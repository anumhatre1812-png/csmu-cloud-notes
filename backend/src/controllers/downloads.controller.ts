import { Response } from 'express';
import { AuthRequest } from '../middleware/verifyFirebaseToken.js';
import { supabase } from '../config/supabase.js';

export const listDownloadHistory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.uid;
    const { limit } = req.query;

    let query = supabase
      .from('download_history')
      .select('*, files(*)')
      .eq('user_id', userId)
      .order('downloaded_at', { ascending: false });

    if (limit) {
      query = query.limit(Number(limit));
    }

    const { data, error } = await query;

    if (error) throw error;

    return res.status(200).json({ success: true, downloads: data });
  } catch (error: any) {
    console.error('List download history error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const logDownload = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.uid;
    const { file_id, file_title, file_category, file_size } = req.body;

    if (!file_id) {
      return res.status(400).json({ error: 'file_id is required' });
    }

    const { data, error } = await supabase
      .from('download_history')
      .insert({
        user_id: userId,
        file_id,
        file_title: file_title || null,
        file_category: file_category || null,
        file_size: file_size || null
      })
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({ success: true, download: data });
  } catch (error: any) {
    console.error('Log download error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
