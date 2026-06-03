import { Response } from 'express';
import { AuthRequest } from '../middleware/verifyFirebaseToken.js';
import { supabase } from '../config/supabase.js';

export const listAnnouncements = async (_req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json({ success: true, announcements: data });
  } catch (error: any) {
    console.error('List announcements error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const createAnnouncement = async (req: AuthRequest, res: Response) => {
  try {
    const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
    const content = typeof req.body.content === 'string' ? req.body.content.trim() : '';

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    if (title.length > 200) {
      return res.status(400).json({ error: 'Title must be 200 characters or less' });
    }

    if (content.length > 2000) {
      return res.status(400).json({ error: 'Content must be 2000 characters or less' });
    }

    const { data, error } = await supabase
      .from('announcements')
      .insert({
        title,
        content,
        created_by: req.user.email || req.user.uid
      })
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({ success: true, announcement: data });
  } catch (error: any) {
    console.error('Create announcement error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const updateAnnouncement = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
    const content = typeof req.body.content === 'string' ? req.body.content.trim() : '';

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    if (title.length > 200) {
      return res.status(400).json({ error: 'Title must be 200 characters or less' });
    }

    if (content.length > 2000) {
      return res.status(400).json({ error: 'Content must be 2000 characters or less' });
    }

    const { data, error } = await supabase
      .from('announcements')
      .update({ title, content, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({ success: true, announcement: data });
  } catch (error: any) {
    console.error('Update announcement error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const deleteAnnouncement = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Delete announcement error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
