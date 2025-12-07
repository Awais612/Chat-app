import { useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ChatHeader from '../components/ChatHeader';
import MessageList from '../components/MessageList';
import MessageInput from '../components/MessageInput';
import CallModal from '../components/CallModal';
import { useChatStore } from '../store/useChatStore';
import { useCallStore } from '../store/useCallStore';

const ChatPage = () => {
  const {
    getUsers,
    selectedUser,
    getMessages,
    subscribeToMessages,
    unsubscribeFromMessages,
    subscribeToOnlineUsers,
    unsubscribeFromOnlineUsers,
  } = useChatStore();

  const { subscribeToCallEvents, unsubscribeFromCallEvents, requestNotificationPermission } = useCallStore();

  useEffect(() => {
    getUsers();
    subscribeToOnlineUsers();
    subscribeToCallEvents();
    requestNotificationPermission();

    return () => {
      unsubscribeFromOnlineUsers();
      unsubscribeFromCallEvents();
    };
  }, [getUsers, subscribeToOnlineUsers, unsubscribeFromOnlineUsers, subscribeToCallEvents, unsubscribeFromCallEvents, requestNotificationPermission]);

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
      subscribeToMessages();
    }

    return () => {
      unsubscribeFromMessages();
    };
  }, [selectedUser, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  return (
    <div className="h-screen flex bg-gray-100">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <ChatHeader />
        
        {selectedUser ? (
          <>
            <MessageList />
            <MessageInput />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary-500 to-indigo-500 rounded-full mb-4 shadow-lg">
                <svg
                  className="w-12 h-12 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to ChatApp</h2>
              <p className="text-gray-500">Select a user from the sidebar to start chatting</p>
            </div>
          </div>
        )}
      </div>

      <CallModal />
    </div>
  );
};

export default ChatPage;
