import { useState, useRef, useEffect } from 'react';
import { IconButton, Box, Typography, Slider } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';

const AudioMessage = ({ src, isMyMessage }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    // Initial duration check
    if (audio.readyState >= 1) {
      handleLoadedMetadata();
    }

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (_, newValue) => {
    const time = newValue;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        minWidth: '200px',
        maxWidth: '300px',
      }}
    >
      <audio ref={audioRef} src={src} preload="metadata" />
      
      <IconButton
        onClick={togglePlay}
        size="small"
        sx={{
          color: isMyMessage ? 'white' : 'text.primary',
          backgroundColor: isMyMessage ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.05)',
          '&:hover': {
            backgroundColor: isMyMessage ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.1)',
          },
        }}
      >
        {isPlaying ? <PauseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
      </IconButton>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Slider
          size="small"
          value={currentTime}
          max={duration || 100}
          onChange={handleSeek}
          sx={{
            color: isMyMessage ? 'white' : 'primary.main',
            height: 4,
            padding: '6px 0',
            '& .MuiSlider-thumb': {
              width: 12,
              height: 12,
              '&:hover, &.Mui-focusVisible': {
                boxShadow: 'none',
              },
            },
            '& .MuiSlider-rail': {
              opacity: isMyMessage ? 0.3 : 0.2,
              backgroundColor: isMyMessage ? 'white' : 'black',
            },
          }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography
            variant="caption"
            sx={{
              color: isMyMessage ? 'rgba(255,255,255,0.8)' : 'text.secondary',
              fontSize: '0.7rem',
              lineHeight: 1,
            }}
          >
            {formatTime(currentTime)}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: isMyMessage ? 'rgba(255,255,255,0.8)' : 'text.secondary',
              fontSize: '0.7rem',
              lineHeight: 1,
            }}
          >
            {formatTime(duration)}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default AudioMessage;
