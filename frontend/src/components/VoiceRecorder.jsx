import { useState, useRef, useEffect } from 'react';
import { IconButton, Box, Typography } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import toast from 'react-hot-toast';

const VoiceRecorder = ({ onSendAudio, onCancel, disabled }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioURL, setAudioURL] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const streamRef = useRef(null);

  const MAX_RECORDING_TIME = 300; 
  const MAX_AUDIO_SIZE = 5 * 1024 * 1024;

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }
    };
  }, [audioURL]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      let mimeType = 'audio/webm';
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          mimeType = 'audio/ogg';
        }
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        
        if (audioBlob.size > MAX_AUDIO_SIZE) {
          toast.error('Recording is too large. Maximum size is 5MB');
          cleanup();
          return;
        }

        setAudioBlob(audioBlob);
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);

        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);


      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= MAX_RECORDING_TIME) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      if (error.name === 'NotAllowedError') {
        toast.error('Microphone permission denied. Please allow access to record audio.');
      } else if (error.name === 'NotFoundError') {
        toast.error('No microphone found. Please connect a microphone.');
      } else {
        toast.error('Failed to start recording. Please try again.');
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const cleanup = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }
    
    setIsRecording(false);
    setRecordingTime(0);
    setAudioBlob(null);
    setAudioURL(null);
    audioChunksRef.current = [];
  };

  const handleCancel = () => {
    if (isRecording) {
      stopRecording();
    }
    cleanup();
    if (onCancel) onCancel();
  };

  const handleSend = async () => {
    if (!audioBlob) return;

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Audio = reader.result;
        onSendAudio(base64Audio);
        cleanup();
      };
      reader.readAsDataURL(audioBlob);
    } catch (error) {
      console.error('Error sending audio:', error);
      toast.error('Failed to send audio message');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (audioBlob && !isRecording) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 2,
          backgroundColor: '#f3f4f6',
          borderRadius: '12px',
        }}
      >
        <audio src={audioURL} controls style={{ flex: 1 }} />
        <Typography variant="caption" color="text.secondary">
          {formatTime(recordingTime)}
        </Typography>
        <IconButton
          onClick={handleCancel}
          color="error"
          size="small"
        >
          <DeleteIcon />
        </IconButton>
        <IconButton
          onClick={handleSend}
          sx={{
            backgroundColor: '#0284c7',
            color: 'white',
            '&:hover': {
              backgroundColor: '#0369a1',
            },
          }}
        >
          <SendIcon />
        </IconButton>
      </Box>
    );
  }

  // Recording in progress
  if (isRecording) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 2,
          backgroundColor: '#fee2e2',
          borderRadius: '12px',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            flex: 1,
          }}
        >
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: '#dc2626',
              animation: 'pulse 1.5s ease-in-out infinite',
              '@keyframes pulse': {
                '0%, 100%': {
                  opacity: 1,
                },
                '50%': {
                  opacity: 0.5,
                },
              },
            }}
          />
          <Typography variant="body2" color="error" fontWeight={500}>
            Recording...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {formatTime(recordingTime)}
          </Typography>
        </Box>
        <IconButton
          onClick={stopRecording}
          color="error"
          size="large"
          sx={{
            backgroundColor: '#dc2626',
            color: 'white',
            '&:hover': {
              backgroundColor: '#b91c1c',
            },
          }}
        >
          <StopIcon />
        </IconButton>
        <IconButton
          onClick={handleCancel}
          color="default"
        >
          <DeleteIcon />
        </IconButton>
      </Box>
    );
  }

  return (
    <IconButton
      onClick={startRecording}
      disabled={disabled}
      color="primary"
      size="large"
    >
      <MicIcon />
    </IconButton>
  );
};

export default VoiceRecorder;
