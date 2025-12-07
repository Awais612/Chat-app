import { Avatar, IconButton } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import VideocamIcon from '@mui/icons-material/Videocam';
import PhoneIcon from '@mui/icons-material/Phone';
import { useChatStore } from '../store/useChatStore';
import { useAuthStore } from '../store/useAuthStore';
import { useCallStore } from '../store/useCallStore';

const ChatHeader = () => {
  const { selectedUser, onlineUsers, isTyping } = useChatStore();
  const { logout } = useAuthStore();
  const { initiateCall } = useCallStore();

  if (!selectedUser) {
    return (
      <div className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-gray-800">Select a conversation</h2>
        </div>
        <IconButton onClick={logout} color="error">
          <LogoutIcon />
        </IconButton>
      </div>
    );
  }

  const isOnline = onlineUsers.includes(selectedUser._id);

  const handleVideoCall = () => {
    initiateCall(selectedUser._id, selectedUser.fullName, 'video');
  };

  const handleAudioCall = () => {
    initiateCall(selectedUser._id, selectedUser.fullName, 'audio');
  };

  return (
    <div className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <Avatar
          src={selectedUser.profilePic}
          alt={selectedUser.fullName}
          sx={{ width: 48, height: 48 }}
        />
        <div>
          <h2 className="text-xl font-semibold text-gray-800">{selectedUser.fullName}</h2>
          <p className="text-sm text-gray-500">
            {isTyping ? (
              <span className="text-primary-600 italic">typing...</span>
            ) : (
              isOnline ? 'Online' : 'Offline'
            )}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {isOnline && (
          <>
            <IconButton onClick={handleVideoCall} color="primary" title="Video call">
              <VideocamIcon />
            </IconButton>
            <IconButton onClick={handleAudioCall} color="primary" title="Audio call">
              <PhoneIcon />
            </IconButton>
          </>
        )}
        <IconButton onClick={logout} color="error">
          <LogoutIcon />
        </IconButton>
      </div>
    </div>
  );
};

export default ChatHeader;
