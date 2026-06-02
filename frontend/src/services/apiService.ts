import axios from 'axios';
import { auth } from '../config/firebase';

const API_URL = import.meta.env.VITE_RAILWAY_API_URL;

const getAuthHeaders = async () => {
  const token = await auth.currentUser?.getIdToken();
  return {
    Authorization: `Bearer ${token}`
  };
};

export const uploadFileApi = async (formData: FormData) => {
  const headers = await getAuthHeaders();
  const { data } = await axios.post(`${API_URL}/api/files/upload`, formData, {
    headers: {
      ...headers,
      'Content-Type': 'multipart/form-data'
    }
  });
  return data;
};

export const deleteFileApi = async (id: string) => {
  const headers = await getAuthHeaders();
  const { data } = await axios.delete(`${API_URL}/api/files/${id}`, { headers });
  return data;
};

export const fetchAdminStats = async () => {
  const headers = await getAuthHeaders();
  const { data } = await axios.get(`${API_URL}/api/admin/stats`, { headers });
  return data;
};
