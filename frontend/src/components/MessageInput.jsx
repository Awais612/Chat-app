import { useState, useRef, useEffect } from 'react';
import { IconButton, TextField, Box } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ImageIcon from '@mui/icons-material/Image';
import CloseIcon from '@mui/icons-material/Close';
import EmojiPicker from 'emoji-picker-react';
import toast from 'react-hot-toast';
import { useChatStore } from '../store/useChatStore';
import VoiceRecorder from './VoiceRecorder';

const MessageInput = () => {
  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const { sendMessage, selectedUser, sendTypingStatus } = useChatStore();
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);
  const fileInputRef = useRef(null);

  // File size limits in bytes
  const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
  const MAX_VIDEO_SIZE = 10 * 1024 * 1024; // 10MB

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTypingRef.current) {
        sendTypingStatus(false);
      }
    };
  }, [selectedUser]);

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    
    if (!newText.trim()) {
      if (isTypingRef.current) {
        sendTypingStatus(false);
        isTypingRef.current = false;
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      return;
    }

    if (!isTypingRef.current) {
      sendTypingStatus(true);
      isTypingRef.current = true;
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      sendTypingStatus(false);
      isTypingRef.current = false;
    }, 2000);
  };

  const handleEmojiClick = (emojiObject) => {
    setText(prev => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      toast.error('Please select an image or video file');
      return;
    }

    // Validate file size
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    
    if (isImage && file.size > MAX_IMAGE_SIZE) {
      toast.error('Image size must be less than 5MB');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    
    if (isVideo && file.size > MAX_VIDEO_SIZE) {
      toast.error('Video size must be less than 10MB');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if ((!text.trim() && !imagePreview) || !selectedUser) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (isTypingRef.current) {
      sendTypingStatus(false);
      isTypingRef.current = false;
    }

    const messageData = {};
    if (text.trim()) {
      messageData.text = text.trim();
    }
    if (imagePreview) {
      messageData.image = imagePreview;
    }

    await sendMessage(messageData);
    setText('');
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendAudio = async (audioData) => {
    if (!selectedUser) return;
    await sendMessage({ audio: audioData });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="p-4 bg-white border-t border-gray-200">
      {imagePreview && (
        <Box sx={{ mb: 2, position: 'relative', display: 'inline-block' }}>
          {imagePreview.startsWith('data:image') ? (
            <img
              src={imagePreview}
              alt="Preview"
              style={{
                maxWidth: '200px',
                maxHeight: '200px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
              }}
            />
          ) : (
            <video
              src={imagePreview}
              controls
              style={{
                maxWidth: '200px',
                maxHeight: '200px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
              }}
            />
          )}
          <IconButton
            onClick={removeImage}
            size="small"
            sx={{
              position: 'absolute',
              top: -8,
              right: -8,
              backgroundColor: 'white',
              boxShadow: 1,
              '&:hover': { backgroundColor: '#fee' },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      )}

      {showEmojiPicker && (
        <Box sx={{ position: 'absolute', bottom: 80, zIndex: 1000 }}>
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </Box>
      )}

      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleImageSelect}
          style={{ display: 'none' }}
        />
        
        <IconButton
          onClick={() => fileInputRef.current?.click()}
          color="primary"
          disabled={!selectedUser || isRecording}
        >
          <ImageIcon />
        </IconButton>

        <IconButton
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          color="primary"
          disabled={!selectedUser || isRecording}
        >
          <EmojiEmotionsIcon />
        </IconButton>

        <form onSubmit={handleSubmit} className="flex-1 flex gap-2">
          <TextField
            fullWidth
            multiline
            maxRows={4}
            value={text}
            onChange={handleTextChange}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            variant="outlined"
            disabled={!selectedUser || isRecording}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '24px',
                '&:hover fieldset': {
                  borderColor: '#0284c7',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#0284c7',
                },
              },
            }}
          />
          
          {text.trim() || imagePreview ? (
            <IconButton
              type="submit"
              color="primary"
              disabled={(!text.trim() && !imagePreview) || !selectedUser}
              sx={{
                backgroundColor: '#0284c7',
                color: 'white',
                width: 48,
                height: 48,
                '&:hover': {
                  backgroundColor: '#0369a1',
                },
                '&:disabled': {
                  backgroundColor: '#e5e7eb',
                  color: '#9ca3af',
                },
              }}
            >
              <SendIcon />
            </IconButton>
          ) : (
            <VoiceRecorder
              onSendAudio={handleSendAudio}
              disabled={!selectedUser}
              onCancel={() => setIsRecording(false)}
            />
          )}
        </form>
      </div>
    </div>
  );
};

export default MessageInput;
