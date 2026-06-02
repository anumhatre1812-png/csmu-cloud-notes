import { Response } from 'express';
import { AuthRequest } from '../middleware/verifyFirebaseToken';
import { supabase } from '../config/supabase';

export const deleteFile = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // 1. Get file metadata to find storage path and category
    const { data: fileData, error: fetchError } = await supabase
      .from('files')
      .select('storage_path, category')
      .eq('id', id)
      .single();

    if (fetchError || !fileData) {
      return res.status(404).json({ error: 'File not found' });
    }

    // 2. Delete from Supabase Storage
    const { error: storageError } = await supabase.storage
      .from(fileData.category)
      .remove([fileData.storage_path]);

    if (storageError) {
      throw storageError;
    }

    // 3. Delete from Database
    const { error: dbError } = await supabase
      .from('files')
      .delete()
      .eq('id', id);

    if (dbError) {
      throw dbError;
    }

    return res.status(200).json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error: any) {
    console.error('Delete error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
