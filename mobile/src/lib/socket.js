import { io } from 'socket.io-client';
import { BASE_URL } from './constants';

let socket = null;

export const initSocket = (userId) => {
  if (!socket && userId) {
    socket = io(BASE_URL, {
      query: { userId },
      transports: ['websocket'], // Force websocket
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
