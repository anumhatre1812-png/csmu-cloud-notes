import { fetchFilesApi, getDownloadUrlApi } from './apiService';

export const fetchFiles = async () => {
  return fetchFilesApi();
};

export const getDownloadUrl = async (id: string) => {
  return getDownloadUrlApi(id);
};
