import { create } from 'zustand';
import axiosInstance from '../lib/axios';
import * as SecureStore from 'expo-secure-store';
// import { initSocket, disconnectSocket } from '../lib/socket'; // To be implemented later

export const useAuthStore = create((set) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,

  checkAuth: async () => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (!token) {
        set({ authUser: null, isCheckingAuth: false });
        return;
      }

      const res = await axiosInstance.get('/auth/check');
      set({ authUser: res.data, isCheckingAuth: false });
      
      // if (res.data?._id) initSocket(res.data._id);
    } catch (error) {
      console.log('Error in checkAuth:', error);
      set({ authUser: null, isCheckingAuth: false });
      // Remove invalid token
      await SecureStore.deleteItemAsync('authToken');
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post('/auth/signup', data);
      
      if (res.data.token) {
        await SecureStore.setItemAsync('authToken', res.data.token);
      }

      set({ authUser: res.data, isSigningUp: false });
      // if (res.data?._id) initSocket(res.data._id);
      return { success: true };
    } catch (error) {
      console.log("Signup error:", error.response?.data?.message);
      set({ isSigningUp: false });
      return { success: false, message: error.response?.data?.message || 'Signup failed' };
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post('/auth/login', data);
      
      if (res.data.token) {
        await SecureStore.setItemAsync('authToken', res.data.token);
      }

      set({ authUser: res.data, isLoggingIn: false });
      // if (res.data?._id) initSocket(res.data._id);
      return { success: true };
    } catch (error) {
      console.log("Login error:", error.response?.data?.message);
      set({ isLoggingIn: false });
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post('/auth/logout');
      await SecureStore.deleteItemAsync('authToken');
      set({ authUser: null });
      // disconnectSocket();
    } catch (error) {
      console.log('Logout error:', error.response?.data?.message);
      // Even if API fails, clear local state
      await SecureStore.deleteItemAsync('authToken');
      set({ authUser: null });
    }
  },

  updateProfile: async (profilePic) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put('/auth/update-profile', { profilePic });
      set({ authUser: res.data, isUpdatingProfile: false });
      return { success: true };
    } catch (error) {
      console.log('Update profile error:', error.response?.data?.message);
      set({ isUpdatingProfile: false });
      return { success: false, message: error.response?.data?.message || 'Update failed' };
    }
  },
}));
