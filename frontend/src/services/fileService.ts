import { fetchFilesApi, getDownloadUrlApi, downloadFileApi, addBookmarkApi, removeBookmarkApi, fetchBookmarksApi, logDownloadApi, fetchDownloadHistoryApi } from './apiService';

const CACHE_NAME = 'csmu-notes-offline';

export const fetchFiles = async () => {
  return fetchFilesApi();
};

export const getDownloadUrl = async (id: string) => {
  return getDownloadUrlApi(id);
};

export const downloadFile = async (url: string, onProgress?: (pct: number) => void) => {
  return downloadFileApi(url, onProgress);
};

export const addBookmark = async (file_id: string) => {
  return addBookmarkApi(file_id);
};

export const removeBookmark = async (bookmarkId: string) => {
  return removeBookmarkApi(bookmarkId);
};

export const fetchBookmarks = async () => {
  return fetchBookmarksApi();
};

export const logDownload = async (payload: { file_id: string; file_title?: string; file_category?: string; file_size?: number }) => {
  try {
    return await logDownloadApi(payload);
  } catch {
    // Backend might not have the table yet — silently fail
  }
};

export const fetchDownloadHistory = async (limit?: number) => {
  try {
    return await fetchDownloadHistoryApi(limit);
  } catch {
    return [];
  }
};

const localStorageBookmarksKey = 'csmu_local_bookmarks';

export const getLocalBookmarks = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(localStorageBookmarksKey) || '[]');
  } catch {
    return [];
  }
};

export const toggleLocalBookmark = (fileId: string): boolean => {
  const bookmarks = getLocalBookmarks();
  const idx = bookmarks.indexOf(fileId);
  if (idx >= 0) {
    bookmarks.splice(idx, 1);
    localStorage.setItem(localStorageBookmarksKey, JSON.stringify(bookmarks));
    return false;
  } else {
    bookmarks.push(fileId);
    localStorage.setItem(localStorageBookmarksKey, JSON.stringify(bookmarks));
    return true;
  }
};

export const isLocallyBookmarked = (fileId: string): boolean => {
  return getLocalBookmarks().includes(fileId);
};

const localStorageDownloadsKey = 'csmu_recent_downloads';

export const getRecentDownloads = (): any[] => {
  try {
    return JSON.parse(localStorage.getItem(localStorageDownloadsKey) || '[]');
  } catch {
    return [];
  }
};

export const addRecentDownload = (file: any) => {
  const downloads = getRecentDownloads();
  const idx = downloads.findIndex((d: any) => d.id === file.id);
  if (idx >= 0) downloads.splice(idx, 1);
  downloads.unshift({ ...file, downloadedAt: new Date().toISOString() });
  if (downloads.length > 50) downloads.length = 50;
  localStorage.setItem(localStorageDownloadsKey, JSON.stringify(downloads));
};

export const cacheFileForOffline = async (fileId: string, blob: Blob): Promise<void> => {
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = new Response(blob);
    cache.put(`/offline-file/${fileId}`, response);
  } catch (err) {
    console.error('Failed to cache file offline:', err);
  }
};

export const getCachedFile = async (fileId: string): Promise<Blob | null> => {
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match(`/offline-file/${fileId}`);
    if (response) return await response.blob();
    return null;
  } catch {
    return null;
  }
};

export const isFileCachedOffline = async (fileId: string): Promise<boolean> => {
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match(`/offline-file/${fileId}`);
    return !!response;
  } catch {
    return false;
  }
};

export const getCachedFileIds = async (): Promise<string[]> => {
  try {
    const cache = await caches.open(CACHE_NAME);
    const keys = await cache.keys();
    return keys.map(k => k.url.split('/offline-file/')[1]).filter(Boolean);
  } catch {
    return [];
  }
};
