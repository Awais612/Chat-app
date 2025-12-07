import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5500';

let socket = null;

export const initSocket = (userId) => {
  if (!socket && userId) {
    socket = io(SOCKET_URL, {
      query: { userId },
      withCredentials: true,
    });
  }
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
