import { create } from 'zustand';
import axiosInstance from '../lib/axios';
import { getSocket } from '../lib/socket';
import { useAuthStore } from './useAuthStore';

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  onlineUsers: [],
  isTyping: false,
  typingUser: null,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get('/messages/users');
      set({ users: res.data, isUsersLoading: false });
    } catch (error) {
      console.log('Failed to load users', error);
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data, isMessagesLoading: false });
      
      const hasUnreadMessages = res.data.some(
        msg => !msg.isRead && msg.receiverId === useAuthStore.getState().authUser?._id
      );
      
      if (hasUnreadMessages) {
        try {
          await axiosInstance.put(`/messages/read/${userId}`);
          
          set({
            messages: get().messages.map(msg => 
              msg.senderId === userId ? { ...msg, isRead: true } : msg
            )
          });
        } catch (error) {
          console.error('Error marking messages as read:', error);
        }
      }
    } catch (error) {
      console.log('Failed to load messages', error);
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    try {
      // Handle FormData for images/audio
      let headers = {};
      // If messageData is simple object use JSON, if FormData use multipart (axios handles this automatically usually)
      
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData,
        { headers: messageData instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {} }
      );
      set({ messages: [...get().messages, res.data] });
      return { success: true };
    } catch (error) {
      console.log('Failed to send message', error);
      return { success: false, error };
    }
  },

  setSelectedUser: async (user) => {
    set({ selectedUser: user });
    
    if (user && user.unreadCount > 0) {
      try {
        await axiosInstance.put(`/messages/read/${user._id}`);
        
        set({
          users: get().users.map(u => 
            u._id === user._id ? { ...u, unreadCount: 0 } : u
          )
        });
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    }
  },

  subscribeToMessages: () => {
    const socket = getSocket();
    if (!socket) return;

    socket.on('newMessage', (newMessage) => {
      const { selectedUser, users } = get();
      const authUser = useAuthStore.getState().authUser;
      
      if (
        newMessage.senderId === selectedUser?._id ||
        newMessage.receiverId === selectedUser?._id
      ) {
        set({ messages: [...get().messages, newMessage] });
      }
      
      set({
        users: users.map(user => {
          const isMessageWithThisUser = 
            user._id === newMessage.senderId || user._id === newMessage.receiverId;
          
          if (isMessageWithThisUser) {
            const isIncomingMessage = newMessage.senderId === user._id && newMessage.receiverId === authUser?._id;
            const isCurrentlyViewing = selectedUser?._id === user._id;
            
            let newUnreadCount = user.unreadCount || 0;
            
            if (isIncomingMessage && !isCurrentlyViewing) {
              newUnreadCount = newUnreadCount + 1;
            }
            
            return {
              ...user,
              lastMessage: newMessage,
              unreadCount: newUnreadCount
            };
          }
          return user;
        }).sort((a, b) => { // Sort by recent message
          const aTime = new Date(a.lastMessage?.createdAt || 0);
          const bTime = new Date(b.lastMessage?.createdAt || 0);
          return bTime - aTime;
        })
      });
    });
    
    socket.on('messages:read', ({ readBy, senderId }) => {
      const { users, messages } = get();
      const authUser = useAuthStore.getState().authUser;
      
      set({
        messages: messages.map(msg => {
          const shouldMarkRead = msg.senderId === authUser?._id && msg.receiverId === readBy;
          return shouldMarkRead ? { ...msg, isRead: true } : msg;
        }),
        users: users.map(user => {
          if (user._id === readBy && user.lastMessage && user.lastMessage.senderId === authUser?._id) {
            return { ...user, lastMessage: { ...user.lastMessage, isRead: true } };
          }
          return user;
        })
      });
    });
    
    socket.on('typing:start', ({ senderId }) => {
        const { selectedUser } = get();
        if (selectedUser?._id === senderId) {
            set({ isTyping: true, typingUser: senderId });
        }
    });

    socket.on('typing:stop', ({ senderId }) => {
        set({ isTyping: false, typingUser: null });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = getSocket();
    if (socket) {
      socket.off('newMessage');
      socket.off('messages:read');
      socket.off('typing:start');
      socket.off('typing:stop');
    }
  },
  
  sendTypingStatus: (isTyping) => {
    const socket = getSocket();
    const { selectedUser } = get();
    
    if (!socket || !selectedUser) return;
    
    if (isTyping) {
      socket.emit('typing:start', { receiverId: selectedUser._id });
    } else {
      socket.emit('typing:stop', { receiverId: selectedUser._id });
    }
  },

  setOnlineUsers: (users) => {
    set({ onlineUsers: users });
  },

  subscribeToOnlineUsers: () => {
    const socket = getSocket();
    if (!socket) return;

    socket.on('getOnlineUsers', (userIds) => {
      set({ onlineUsers: userIds });
    });
  },

  unsubscribeFromOnlineUsers: () => {
    const socket = getSocket();
    if (socket) {
      socket.off('getOnlineUsers');
    }
  },
}));
