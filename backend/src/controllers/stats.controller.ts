import { Response } from 'express';
import { AuthRequest } from '../middleware/verifyFirebaseToken';
import { supabase } from '../config/supabase';

export const getStats = async (req: AuthRequest, res: Response) => {
  try {
    // 1. Get total file count and size
    const { data: files, error: filesError } = await supabase
      .from('files')
      .select('category, file_size');

    if (filesError) throw filesError;

    const totalFiles = files.length;
    const totalSize = files.reduce((acc, curr) => acc + (curr.file_size || 0), 0);

    // 2. Count per category
    const categoryStats: Record<string, number> = {
      'notes': 0,
      'assignments': 0,
      'lab-manuals': 0,
      'question-papers': 0,
      'question-bank': 0
    };

    files.forEach(f => {
      if (categoryStats[f.category] !== undefined) {
        categoryStats[f.category]++;
      }
    });

    return res.status(200).json({
      success: true,
      stats: {
        totalFiles,
        totalSize,
        categoryStats
      }
    });

  } catch (error: any) {
    console.error('Stats error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
