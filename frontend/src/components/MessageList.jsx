import { useEffect, useRef } from 'react';
import { useChatStore } from '../store/useChatStore';
import { useAuthStore } from '../store/useAuthStore';
import { Avatar } from '@mui/material';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import AudioMessage from './AudioMessage';

const MessageList = () => {
  const { messages, selectedUser, isMessagesLoading, isTyping } = useChatStore();
  const { authUser } = useAuthStore();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (messages.length === 0 && !isTyping) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="text-lg">No messages yet</p>
          <p className="text-sm">Start the conversation!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => {
        const isMyMessage = message.senderId === authUser?._id;
        const showAvatar = !isMyMessage;

        return (
          <div
            key={message._id}
            className={`flex items-end gap-2 ${isMyMessage ? 'justify-end' : 'justify-start'}`}
          >
            {showAvatar && (
              <Avatar
                src={selectedUser?.profilePic}
                alt={selectedUser?.fullName}
                sx={{ width: 32, height: 32 }}
              />
            )}

            <div
              className={`max-w-[70%] ${
                isMyMessage ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-900'
              } rounded-2xl px-4 py-2`}
            >
              {message.image && (
                <img
                  src={message.image}
                  alt="Message attachment"
                  className="rounded-lg mb-2 max-w-full"
                />
              )}
              
              {message.audio && (
                <div className="mb-2">
                  <AudioMessage src={message.audio} isMyMessage={isMyMessage} />
                </div>
              )}

              {message.text && <p className="break-words">{message.text}</p>}
              
              <div className={`flex items-center gap-1 mt-1 text-xs ${
                isMyMessage ? 'text-gray-200' : 'text-gray-500'
              }`}>
                <span>{formatTime(message.createdAt)}</span>
                {isMyMessage && (
                  <DoneAllIcon 
                    sx={{ 
                      fontSize: 16, 
                      color: message.isRead ? '#53bdeb' : 'rgba(255, 255, 255, 0.6)',
                      marginLeft: '4px'
                    }} 
                  />
                )}
              </div>
            </div>

            {isMyMessage && (
              <Avatar
                src={authUser?.profilePic}
                alt={authUser?.fullName}
                sx={{ width: 32, height: 32 }}
              />
            )}
          </div>
        );
      })}
      
      {isTyping && (
        <div className="flex items-end gap-2 justify-start">
          <Avatar
            src={selectedUser?.profilePic}
            alt={selectedUser?.fullName}
            sx={{ width: 32, height: 32 }}
          />
          <div className="bg-gray-200 rounded-2xl px-4 py-3">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
