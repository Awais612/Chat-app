import { create } from 'zustand';
import { getSocket } from '../lib/socket';
import { createPeerConnection, getMediaStream, stopMediaStream } from '../lib/webrtc';
import toast from 'react-hot-toast';
import { useAuthStore } from './useAuthStore';
import { useChatStore } from './useChatStore';
import { showNotification, playRingtone, stopRingtone, requestNotificationPermission } from '../lib/notifications';

export const useCallStore = create((set, get) => ({
  incomingCall: null,
  outgoingCall: null,
  activeCall: null,
  localStream: null,
  remoteStream: null,
  peerConnection: null,
  callType: null,

  initiateCall: async (receiverId, receiverName, callType) => {
    const socket = getSocket();
    const authUser = useAuthStore.getState().authUser;
    
    if (!socket || !authUser) {
      toast.error('Connection error');
      return;
    }

    try {
      const stream = await getMediaStream(true, callType === 'video');
      
      set({
        localStream: stream,
        outgoingCall: { receiverId, receiverName, callType },
        callType,
      });

      socket.emit('call:initiate', {
        callerId: authUser._id,
        receiverId,
        callType,
      });
    } catch (error) {
      console.error('Error initiating call:', error);
      if (error.name === 'NotAllowedError') {
        toast.error('Camera/microphone permission denied');
      } else {
        toast.error('Failed to access media devices');
      }
      get().endCall();
    }
  },

  acceptCall: async () => {
    const { incomingCall } = get();
    if (!incomingCall) return;

    const socket = getSocket();
    if (!socket) return;

    try {
      const stream = await getMediaStream(true, incomingCall.callType === 'video');
      
      const pc = createPeerConnection();
      
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      pc.ontrack = (event) => {
        set({ remoteStream: event.streams[0] });
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('call:ice-candidate', {
            candidate: event.candidate,
            targetId: incomingCall.callerId,
          });
        }
      };

      set({
        localStream: stream,
        peerConnection: pc,
        activeCall: {
          userId: incomingCall.callerId,
          userName: incomingCall.callerName,
          callType: incomingCall.callType,
        },
        incomingCall: null,
      });

      const authUser = useAuthStore.getState().authUser;
      
      socket.emit('call:accept', {
        callerId: incomingCall.callerId,
        receiverId: authUser._id,
      });
      
      stopRingtone();
    } catch (error) {
      console.error('Error accepting call:', error);
      toast.error('Failed to accept call');
      stopRingtone();
      get().rejectCall();
    }
  },

  rejectCall: () => {
    const { incomingCall } = get();
    if (!incomingCall) return;

    const socket = getSocket();
    const authUser = useAuthStore.getState().authUser;
    
    if (socket && authUser) {
      socket.emit('call:reject', {
        callerId: incomingCall.callerId,
        receiverId: authUser._id,
      });
    }

    stopRingtone();
    set({ incomingCall: null });
  },

  endCall: () => {
    const { localStream, peerConnection, activeCall, outgoingCall } = get();
    const socket = getSocket();

    stopRingtone();

    if (localStream) {
      stopMediaStream(localStream);
    }

    if (peerConnection) {
      peerConnection.close();
    }

    const targetId = activeCall?.userId || outgoingCall?.receiverId;
    const authUser = useAuthStore.getState().authUser;
    
    if (socket && targetId && authUser) {
      socket.emit('call:end', {
        callerId: authUser._id,
        receiverId: targetId,
      });
    }

    set({
      incomingCall: null,
      outgoingCall: null,
      activeCall: null,
      localStream: null,
      remoteStream: null,
      peerConnection: null,
      callType: null,
    });
  },

  handleIncomingCall: (callerId, callerName, callType) => {
    const users = useChatStore.getState().users;
    const caller = users.find(u => u._id === callerId);
    const displayName = caller?.fullName || callerName || 'Unknown User';
    
    set({
      incomingCall: { callerId, callerName: displayName, callType },
    });
    
    playRingtone();
    
    showNotification(`Incoming ${callType} call`, {
      body: `${displayName} is calling you...`,
      requireInteraction: true,
    });
  },

  handleCallAccepted: async (receiverId) => {
    const { localStream, outgoingCall } = get();
    const socket = getSocket();
    
    if (!localStream || !socket) return;

    const pc = createPeerConnection();

    localStream.getTracks().forEach((track) => {
      pc.addTrack(track, localStream);
    });

    pc.ontrack = (event) => {
      set({ remoteStream: event.streams[0] });
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('call:ice-candidate', {
          candidate: event.candidate,
          targetId: receiverId,
        });
      }
    };

    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit('call:offer', {
        offer,
        receiverId,
      });

      set({
        peerConnection: pc,
        activeCall: {
          userId: receiverId,
          userName: outgoingCall?.receiverName,
          callType: outgoingCall?.callType,
        },
        outgoingCall: null,
      });
    } catch (error) {
      console.error('Error creating offer:', error);
      toast.error('Call connection failed');
      get().endCall();
    }
  },

  handleCallRejected: () => {
    toast.error('Call was declined');
    get().endCall();
  },

  handleCallEnded: () => {
    get().endCall();
  },

  handleOffer: async (offer, senderId) => {
    const { peerConnection } = get();
    const socket = getSocket();
    
    if (!peerConnection || !socket) return;

    try {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      socket.emit('call:answer', {
        answer,
        callerId: senderId,
      });
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  },

  handleAnswer: async (answer) => {
    const { peerConnection } = get();
    
    if (!peerConnection) return;

    try {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  },

  handleIceCandidate: async (candidate) => {
    const { peerConnection } = get();
    
    if (!peerConnection) return;

    try {
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
    }
  },

  subscribeToCallEvents: () => {
    const socket = getSocket();
    if (!socket) return;

    socket.on('call:incoming', ({ callerId, callType }) => {
      get().handleIncomingCall(callerId, 'User', callType);
    });

    socket.on('call:accepted', ({ receiverId }) => {
      get().handleCallAccepted(receiverId);
    });

    socket.on('call:rejected', () => {
      get().handleCallRejected();
    });

    socket.on('call:ended', () => {
      get().handleCallEnded();
    });

    socket.on('call:offer', ({ offer, senderId }) => {
      get().handleOffer(offer, senderId);
    });

    socket.on('call:answer', ({ answer }) => {
      get().handleAnswer(answer);
    });

    socket.on('call:ice-candidate', ({ candidate }) => {
      get().handleIceCandidate(candidate);
    });
  },

  unsubscribeFromCallEvents: () => {
    const socket = getSocket();
    if (!socket) return;

    socket.off('call:incoming');
    socket.off('call:accepted');
    socket.off('call:rejected');
    socket.off('call:ended');
    socket.off('call:offer');
    socket.off('call:answer');
    socket.off('call:ice-candidate');
  },
  
  requestNotificationPermission: async () => {
    await requestNotificationPermission();
  },
}));
