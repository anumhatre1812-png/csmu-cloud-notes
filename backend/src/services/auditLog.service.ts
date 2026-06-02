import { supabase } from '../config/supabase.js';

type AdminAction = 'upload' | 'edit' | 'delete';

interface AuditLogInput {
  adminEmail?: string;
  action: AdminAction;
  fileId?: string | null;
  fileTitle?: string | null;
  metadata?: Record<string, unknown>;
}

export const logAdminAction = async ({
  adminEmail,
  action,
  fileId,
  fileTitle,
  metadata
}: AuditLogInput) => {
  if (!adminEmail) return;

  const { error } = await supabase
    .from('admin_actions')
    .insert({
      admin_email: adminEmail,
      action,
      file_id: fileId || null,
      file_title: fileTitle || null,
      metadata: metadata || {}
    });

  if (error) {
    console.error('Audit log error:', error);
  }
};
