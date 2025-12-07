const ICE_SERVERS = {
  iceServers: [
    {
      urls: [
        'stun:stun.l.google.com:19302',
        'stun:stun1.l.google.com:19302',
      ],
    },
  ],
};

export const createPeerConnection = () => {
  return new RTCPeerConnection(ICE_SERVERS);
};

export const getMediaStream = async (audio = true, video = true) => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio,
      video: video ? { width: { ideal: 1280 }, height: { ideal: 720 } } : false,
    });
    return stream;
  } catch (error) {
    console.error('Error accessing media devices:', error);
    throw error;
  }
};

export const stopMediaStream = (stream) => {
  if (stream) {
    stream.getTracks().forEach((track) => {
      track.stop();
    });
  }
};
