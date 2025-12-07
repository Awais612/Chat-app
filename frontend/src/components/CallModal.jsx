import { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  Avatar,
  IconButton,
  Box,
  Typography,
} from '@mui/material';
import CallIcon from '@mui/icons-material/Call';
import CallEndIcon from '@mui/icons-material/CallEnd';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import { useCallStore } from '../store/useCallStore';
import { useChatStore } from '../store/useChatStore';

const CallModal = () => {
  const {
    incomingCall,
    outgoingCall,
    activeCall,
    localStream,
    remoteStream,
    acceptCall,
    rejectCall,
    endCall,
  } = useCallStore();

  const { users } = useChatStore();
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);
  
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteStream) {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = remoteStream;
      }
    }
  }, [remoteStream]);

  useEffect(() => {
    let interval;
    if (activeCall) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [activeCall]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const getCallUser = () => {
    const userId = incomingCall?.callerId || outgoingCall?.receiverId || activeCall?.userId;
    return users.find((user) => user._id === userId);
  };

  const callUser = getCallUser();
  const isOpen = !!(incomingCall || outgoingCall || activeCall);
  const isVideoCall = (incomingCall?.callType || outgoingCall?.callType || activeCall?.callType) === 'video';

  return (
    <Dialog
      open={isOpen}
      onClose={() => {}}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden',
        },
      }}
    >
      <DialogContent sx={{ p: 0, position: 'relative', height: '600px', bgcolor: '#1a1a1a' }}>
        {incomingCall && (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}
          >
            <Avatar
              src={callUser?.profilePic}
              alt={callUser?.fullName}
              sx={{ width: 120, height: 120, mb: 3 }}
            />
            <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
              {callUser?.fullName}
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, color: '#aaa' }}>
              Incoming {incomingCall.callType} call...
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 3 }}>
              <IconButton
                onClick={rejectCall}
                sx={{
                  bgcolor: '#dc2626',
                  color: 'white',
                  width: 64,
                  height: 64,
                  '&:hover': { bgcolor: '#b91c1c' },
                }}
              >
                <CallEndIcon sx={{ fontSize: 32 }} />
              </IconButton>
              <IconButton
                onClick={acceptCall}
                sx={{
                  bgcolor: '#16a34a',
                  color: 'white',
                  width: 64,
                  height: 64,
                  '&:hover': { bgcolor: '#15803d' },
                }}
              >
                <CallIcon sx={{ fontSize: 32 }} />
              </IconButton>
            </Box>
          </Box>
        )}

        {outgoingCall && (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}
          >
            <Avatar
              src={callUser?.profilePic}
              alt={callUser?.fullName}
              sx={{ width: 120, height: 120, mb: 3 }}
            />
            <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
              {callUser?.fullName}
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, color: '#aaa' }}>
              Calling...
            </Typography>
            
            <IconButton
              onClick={endCall}
              sx={{
                bgcolor: '#dc2626',
                color: 'white',
                width: 64,
                height: 64,
                '&:hover': { bgcolor: '#b91c1c' },
              }}
            >
              <CallEndIcon sx={{ fontSize: 32 }} />
            </IconButton>
          </Box>
        )}

        {activeCall && (
          <>
            {isVideoCall ? (
              <Box sx={{ position: 'relative', height: '100%' }}>
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    backgroundColor: '#000',
                  }}
                />
                
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    position: 'absolute',
                    bottom: 20,
                    right: 20,
                    width: '200px',
                    height: '150px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    border: '2px solid white',
                    backgroundColor: '#000',
                    display: isVideoOff ? 'none' : 'block',
                  }}
                />

                <Box
                  sx={{
                    position: 'absolute',
                    top: 20,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    bgcolor: 'rgba(0,0,0,0.6)',
                    color: 'white',
                    px: 3,
                    py: 1,
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="body2">{formatDuration(callDuration)}</Typography>
                </Box>
              </Box>
            ) : (
              <Box
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                }}
              >
                <Avatar
                  src={callUser?.profilePic}
                  alt={callUser?.fullName}
                  sx={{ width: 120, height: 120, mb: 3 }}
                />
                <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
                  {callUser?.fullName}
                </Typography>
                <Typography variant="body1" sx={{ color: '#aaa' }}>
                  {formatDuration(callDuration)}
                </Typography>
              </Box>
            )}

            <Box
              sx={{
                position: 'absolute',
                bottom: 30,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: 2,
              }}
            >
              <IconButton
                onClick={toggleMute}
                sx={{
                  bgcolor: isMuted ? '#dc2626' : 'rgba(255,255,255,0.2)',
                  color: 'white',
                  '&:hover': { bgcolor: isMuted ? '#b91c1c' : 'rgba(255,255,255,0.3)' },
                }}
              >
                {isMuted ? <MicOffIcon /> : <MicIcon />}
              </IconButton>

              {isVideoCall && (
                <IconButton
                  onClick={toggleVideo}
                  sx={{
                    bgcolor: isVideoOff ? '#dc2626' : 'rgba(255,255,255,0.2)',
                    color: 'white',
                    '&:hover': { bgcolor: isVideoOff ? '#b91c1c' : 'rgba(255,255,255,0.3)' },
                  }}
                >
                  {isVideoOff ? <VideocamOffIcon /> : <VideocamIcon />}
                </IconButton>
              )}

              <IconButton
                onClick={endCall}
                sx={{
                  bgcolor: '#dc2626',
                  color: 'white',
                  '&:hover': { bgcolor: '#b91c1c' },
                }}
              >
                <CallEndIcon />
              </IconButton>
            </Box>
          </>
        )}
        
        <audio
          ref={remoteAudioRef}
          autoPlay
          style={{ display: 'none' }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CallModal;
