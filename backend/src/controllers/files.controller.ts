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
