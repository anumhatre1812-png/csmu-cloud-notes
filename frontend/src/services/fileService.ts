import { fetchFilesApi, getDownloadUrlApi, downloadFileApi } from './apiService';

export const fetchFiles = async () => {
  return fetchFilesApi();
};

export const getDownloadUrl = async (id: string) => {
  return getDownloadUrlApi(id);
};

export const downloadFile = async (url: string, onProgress?: (pct: number) => void) => {
  return downloadFileApi(url, onProgress);
};
