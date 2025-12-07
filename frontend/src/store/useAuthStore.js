import { create } from 'zustand';
import axiosInstance from '../lib/axios';
import toast from 'react-hot-toast';
import { initSocket, disconnectSocket } from '../lib/socket';

export const useAuthStore = create((set) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get('/api/auth/check');
      set({ authUser: res.data, isCheckingAuth: false });
     
      if (res.data && res.data._id) {
        initSocket(res.data._id);
      }
    } catch (error) {
      console.log('Error in checkAuth:', error);
      set({ authUser: null, isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post('/api/auth/signup', data);
      set({ authUser: res.data, isSigningUp: false });
      toast.success('Account created successfully!');
      
      if (res.data && res.data._id) {
        initSocket(res.data._id);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Signup failed');
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post('/api/auth/login', data);
      set({ authUser: res.data, isLoggingIn: false });
      toast.success('Logged in successfully!');
      
      if (res.data && res.data._id) {
        initSocket(res.data._id);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post('/api/auth/logout');
      set({ authUser: null });
      toast.success('Logged out successfully!');
    
      disconnectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Logout failed');
    }
  },

  updateProfile: async (profilePic) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put('/api/auth/update-profile', { profilePic });
      set({ authUser: res.data, isUpdatingProfile: false });
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
      set({ isUpdatingProfile: false });
    }
  },
}));
