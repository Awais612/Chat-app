import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { BASE_URL } from './constants';

const axiosInstance = axios.create({
  baseURL: BASE_URL + '/api',
  withCredentials: true,
});

axiosInstance.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Error fetching token', error);
  }
  return config;
});

export default axiosInstance;
