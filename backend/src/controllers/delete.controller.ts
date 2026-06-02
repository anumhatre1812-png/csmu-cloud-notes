import { Response } from 'express';
import { AuthRequest } from '../middleware/verifyFirebaseToken.js';
import { supabase } from '../config/supabase.js';
import { logAdminAction } from '../services/auditLog.service.js';

export const deleteFile = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // 1. Get file metadata to find storage path and category
    const { data: fileData, error: fetchError } = await supabase
      .from('files')
      .select('id, title, storage_path, category, file_size, file_type')
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

    await logAdminAction({
      adminEmail: req.user.email,
      action: 'delete',
      fileId: fileData.id,
      fileTitle: fileData.title,
      metadata: {
        category: fileData.category,
        file_size: fileData.file_size,
        file_type: fileData.file_type
      }
    });

    return res.status(200).json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error: any) {
    console.error('Delete error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
