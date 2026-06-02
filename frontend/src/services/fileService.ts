import { supabase } from '../config/supabase';

export const fetchFiles = async () => {
  const { data, error } = await supabase
    .from('files')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data;
};

export const getDownloadUrl = async (category: string, path: string) => {
  const { data, error } = await supabase.storage
    .from(category)
    .createSignedUrl(path, 60); // 60 seconds expiry

  if (error) {
    throw error;
  }

  return data.signedUrl;
};
