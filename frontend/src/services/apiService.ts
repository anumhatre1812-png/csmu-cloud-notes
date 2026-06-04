import axios from 'axios';
import { auth } from '../config/firebase';

const API_URL = import.meta.env.VITE_RAILWAY_API_URL;

const getAuthHeaders = async () => {
  const token = await auth.currentUser?.getIdToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
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

export const getPreviewBlobApi = async (id: string) => {
  const headers = await getAuthHeaders();
  const { data, headers: responseHeaders } = await axios.get(`${API_URL}/api/files/${id}/preview`, {
    headers,
    responseType: 'blob'
  });
  return { blob: data, type: (responseHeaders['content-type'] as string | undefined) };
};

export const fetchAdminStats = async () => {
  const headers = await getAuthHeaders();
  const { data } = await axios.get(`${API_URL}/api/admin/stats`, { headers });
  return data;
};

export const fetchBookmarksApi = async () => {
  const headers = await getAuthHeaders();
  const { data } = await axios.get(`${API_URL}/api/bookmarks`, { headers });
  return data.bookmarks;
};

export const addBookmarkApi = async (file_id: string) => {
  const headers = await getAuthHeaders();
  const { data } = await axios.post(`${API_URL}/api/bookmarks`, { file_id }, { headers });
  return data.bookmark;
};

export const removeBookmarkApi = async (bookmarkId: string) => {
  const headers = await getAuthHeaders();
  const { data } = await axios.delete(`${API_URL}/api/bookmarks/${bookmarkId}`, { headers });
  return data;
};

export const logDownloadApi = async (payload: { file_id: string; file_title?: string; file_category?: string; file_size?: number }) => {
  const headers = await getAuthHeaders();
  const { data } = await axios.post(`${API_URL}/api/downloads`, payload, { headers });
  return data.download;
};

export const fetchDownloadHistoryApi = async (limit?: number) => {
  const headers = await getAuthHeaders();
  const params = limit ? { limit } : {};
  const { data } = await axios.get(`${API_URL}/api/downloads`, { headers, params });
  return data.downloads;
};

export const fetchActivityLogsApi = async (page = 1, limit = 50) => {
  const headers = await getAuthHeaders();
  const { data } = await axios.get(`${API_URL}/api/admin/activity`, { headers, params: { page, limit } });
  return data;
};

export const fetchAnnouncementsApi = async () => {
  const headers = await getAuthHeaders();
  const { data } = await axios.get(`${API_URL}/api/announcements`, { headers });
  return data.announcements;
};

export const createAnnouncementApi = async (payload: { title: string; content: string }) => {
  const headers = await getAuthHeaders();
  const { data } = await axios.post(`${API_URL}/api/announcements`, payload, { headers });
  return data.announcement;
};

export const updateAnnouncementApi = async (id: string, payload: { title: string; content: string }) => {
  const headers = await getAuthHeaders();
  const { data } = await axios.patch(`${API_URL}/api/announcements/${id}`, payload, { headers });
  return data.announcement;
};

export const deleteAnnouncementApi = async (id: string) => {
  const headers = await getAuthHeaders();
  const { data } = await axios.delete(`${API_URL}/api/announcements/${id}`, { headers });
  return data;
};
