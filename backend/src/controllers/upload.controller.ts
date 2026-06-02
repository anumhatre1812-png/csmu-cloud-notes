import { Response } from 'express';
import { AuthRequest } from '../middleware/verifyFirebaseToken.js';
import { supabase } from '../config/supabase.js';
import { logAdminAction } from '../services/auditLog.service.js';
import { v4 as uuidv4 } from 'uuid';

const VALID_CATEGORIES = new Set([
  'notes',
  'assignments',
  'lab-manuals',
  'question-papers',
  'question-bank'
]);

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
  'image/webp'
]);

const sanitizeFileName = (fileName: string) => {
  return fileName
    .replace(/[/\\?%*:|"<>]/g, '')
    .replace(/\s+/g, '_')
    .slice(0, 120);
};

export const uploadFile = async (req: AuthRequest, res: Response) => {
  try {
    const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
    const category = typeof req.body.category === 'string' ? req.body.category.trim() : '';
    const subject = typeof req.body.subject === 'string' ? req.body.subject.trim() : '';
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!title || !category) {
      return res.status(400).json({ error: 'Title and category are required' });
    }

    if (!VALID_CATEGORIES.has(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    if (title.length > 160) {
      return res.status(400).json({ error: 'Title must be 160 characters or less' });
    }

    if (subject.length > 120) {
      return res.status(400).json({ error: 'Subject must be 120 characters or less' });
    }

    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const fileName = `${uuidv4()}-${sanitizeFileName(file.originalname)}`;
    const filePath = `${year}/${month}/${fileName}`;

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
        subject: subject || null,
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

    await logAdminAction({
      adminEmail: req.user.email,
      action: 'upload',
      fileId: dbData.id,
      fileTitle: dbData.title,
      metadata: {
        category,
        file_size: file.size,
        file_type: file.mimetype
      }
    });

    return res.status(200).json({
      success: true,
      file: dbData
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
