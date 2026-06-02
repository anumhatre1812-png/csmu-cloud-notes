import { Response } from 'express';
import { AuthRequest } from '../middleware/verifyFirebaseToken.js';
import { supabase } from '../config/supabase.js';
import { v4 as uuidv4 } from 'uuid';

export const uploadFile = async (req: AuthRequest, res: Response) => {
  try {
    const { title, category, subject } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!title || !category) {
      return res.status(400).json({ error: 'Title and category are required' });
    }

    const fileExt = file.originalname.split('.').pop();
    const fileName = `${uuidv4()}-${file.originalname.replace(/\s+/g, '_')}`;
    const filePath = `${category}/${new Date().getFullYear()}/${new Date().getMonth() + 1}/${fileName}`;

    // 1. Upload to Supabase Storage
    const { data: storageData, error: storageError } = await supabase.storage
      .from(category)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (storageError) {
      throw storageError;
    }

    // 2. Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from(category)
      .getPublicUrl(filePath);

    // 3. Insert into Database
    const { data: dbData, error: dbError } = await supabase
      .from('files')
      .insert({
        title,
        category,
        subject,
        file_url: publicUrl,
        storage_path: filePath,
        file_type: file.mimetype,
        file_size: file.size,
        uploader_name: req.user.name || req.user.email,
        uploader_email: req.user.email
      })
      .select()
      .single();

    if (dbError) {
      // Cleanup: delete uploaded file if DB insert fails
      await supabase.storage.from(category).remove([filePath]);
      throw dbError;
    }

    return res.status(200).json({
      success: true,
      file: dbData
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
