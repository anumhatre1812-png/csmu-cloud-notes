import { Response } from 'express';
import { AuthRequest } from '../middleware/verifyFirebaseToken.js';
import { supabase } from '../config/supabase.js';

export const listFiles = async (_req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json({
      success: true,
      files: data
    });
  } catch (error: any) {
    console.error('List files error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const createDownloadUrl = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const { data: fileData, error: fetchError } = await supabase
      .from('files')
      .select('category, storage_path')
      .eq('id', id)
      .single();

    if (fetchError || !fileData) {
      return res.status(404).json({ error: 'File not found' });
    }

    const { data, error } = await supabase.storage
      .from(fileData.category)
      .createSignedUrl(fileData.storage_path, 60);

    if (error) throw error;

    return res.status(200).json({
      success: true,
      signedUrl: data.signedUrl
    });
  } catch (error: any) {
    console.error('Download URL error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const updateFileMetadata = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
    const subject = typeof req.body.subject === 'string' ? req.body.subject.trim() : '';

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    if (title.length > 160) {
      return res.status(400).json({ error: 'Title must be 160 characters or less' });
    }

    if (subject.length > 120) {
      return res.status(400).json({ error: 'Subject must be 120 characters or less' });
    }

    const { data, error } = await supabase
      .from('files')
      .update({
        title,
        subject: subject || null
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      file: data
    });
  } catch (error: any) {
    console.error('Update file metadata error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
