import axios from 'axios';
import { auth } from '../config/firebase';

const API_URL = import.meta.env.VITE_RAILWAY_API_URL;

const getAuthHeaders = async () => {
  const token = await auth.currentUser?.getIdToken();
  return { Authorization: `Bearer ${token}` };
};

export const uploadFileApi = async (formData: FormData, onProgress?: (progress: number) => void) => {
  const headers = await getAuthHeaders();
  const { data } = await axios.post(`${API_URL}/api/files/upload`, formData, {
    headers: { ...headers, 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (event) => {
      if (!event.total || !onProgress) return;
      onProgress(Math.round((event.loaded * 100) / event.total));
    }
  });
  return data;
};

export const deleteFileApi = async (id: string) => {
  const headers = await getAuthHeaders();
  const { data } = await axios.delete(`${API_URL}/api/files/${id}`, { headers });
  return data;
};

export const updateFileMetadataApi = async (id: string, payload: { title: string; subject: string }) => {
  const headers = await getAuthHeaders();
  const { data } = await axios.patch(`${API_URL}/api/files/${id}`, payload, { headers });
  return data.file;
};

export const fetchFilesApi = async () => {
  const headers = await getAuthHeaders();
  const { data } = await axios.get(`${API_URL}/api/files`, { headers });
  return data.files;
};

export const getDownloadUrlApi = async (id: string) => {
  const headers = await getAuthHeaders();
  const { data } = await axios.get(`${API_URL}/api/files/${id}/download-url`, { headers });
  return data.signedUrl;
};

export const downloadFileApi = async (url: string, onProgress?: (pct: number) => void) => {
  const { data, headers } = await axios.get(url, {
    responseType: 'blob',
    onDownloadProgress: (event) => {
      if (!event.total || !onProgress) return;
      onProgress(Math.round((event.loaded * 100) / event.total));
    }
  });
  const disposition = headers['content-disposition'];
  const filename = disposition?.match(/filename="?(.+?)"?$/)?.[1] || 'download';
  return { blob: data, filename };
};

export const fetchAdminStats = async () => {
  const headers = await getAuthHeaders();
  const { data } = await axios.get(`${API_URL}/api/admin/stats`, { headers });
  return data;
};
