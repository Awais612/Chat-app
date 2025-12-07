import { useState } from 'react';
import { useChatStore } from '../store/useChatStore';
import { useAuthStore } from '../store/useAuthStore';
import { Avatar, Badge } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DoneIcon from '@mui/icons-material/Done';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { styled } from '@mui/material/styles';
import { formatMessageTime, truncateMessage } from '../lib/utils';

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#44b700',
    color: '#44b700',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}));

const UnreadBadge = styled(Badge)(() => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#25D366',
    color: 'white',
    fontWeight: 600,
    fontSize: '0.7rem',
    minWidth: '20px',
    height: '20px',
  },
}));

const Sidebar = () => {
  const { users, selectedUser, setSelectedUser, onlineUsers, isUsersLoading } = useChatStore();
  const { authUser } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter((user) =>
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isUserOnline = (userId) => {
    return onlineUsers.includes(userId);
  };

  const getMessagePreview = (user) => {
    if (!user.lastMessage) return 'No messages yet';
    
    const isMyMessage = user.lastMessage.senderId === authUser?._id;
    let preview = '';
    
    if (user.lastMessage.image) {
      preview = '📷 Photo';
    } else {
      preview = truncateMessage(user.lastMessage.text, 30);
    }
    
    return isMyMessage ? `You: ${preview}` : preview;
  };

  const getMessageStatus = (user) => {
    if (!user.lastMessage || user.lastMessage.senderId !== authUser?._id) {
      return null;
    }
    
    if (user.lastMessage.isRead) {
      return <DoneAllIcon sx={{ fontSize: 16, color: '#53bdeb' }} />;
    }
    
    return <DoneAllIcon sx={{ fontSize: 16, color: '#8696a0' }} />;
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Messages</h2>
        
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isUsersLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div>
            {filteredUsers.map((user) => (
              <div
                key={user._id}
                onClick={() => setSelectedUser(user)}
                className={`flex items-center gap-3 p-3 cursor-pointer transition-all hover:bg-gray-50 ${
                  selectedUser?._id === user._id ? 'bg-primary-50' : ''
                }`}
              >
                <div className="flex-shrink-0">
                  {user.unreadCount > 0 ? (
                    <UnreadBadge
                      badgeContent={user.unreadCount}
                      max={99}
                    >
                      {isUserOnline(user._id) ? (
                        <StyledBadge
                          overlap="circular"
                          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                          variant="dot"
                        >
                          <Avatar
                            src={user.profilePic}
                            alt={user.fullName}
                            sx={{ width: 48, height: 48 }}
                          />
                        </StyledBadge>
                      ) : (
                        <Avatar
                          src={user.profilePic}
                          alt={user.fullName}
                          sx={{ width: 48, height: 48 }}
                        />
                      )}
                    </UnreadBadge>
                  ) : (
                    <>
                      {isUserOnline(user._id) ? (
                        <StyledBadge
                          overlap="circular"
                          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                          variant="dot"
                        >
                          <Avatar
                            src={user.profilePic}
                            alt={user.fullName}
                            sx={{ width: 48, height: 48 }}
                          />
                        </StyledBadge>
                      ) : (
                        <Avatar
                          src={user.profilePic}
                          alt={user.fullName}
                          sx={{ width: 48, height: 48 }}
                        />
                      )}
                    </>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className={`font-semibold text-gray-800 truncate ${
                      user.unreadCount > 0 ? 'font-bold' : ''
                    }`}>
                      {user.fullName}
                    </h3>
                    {user.lastMessage && (
                      <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                        {formatMessageTime(user.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {getMessageStatus(user)}
                    <p className={`text-sm truncate ${
                      user.unreadCount > 0 ? 'text-gray-800 font-semibold' : 'text-gray-500'
                    }`}>
                      {getMessagePreview(user)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredUsers.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                No users found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
