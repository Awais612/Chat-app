export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

export const showNotification = (title, options = {}) => {
  if (Notification.permission === 'granted') {
    return new Notification(title, {
      icon: '/vite.svg',
      badge: '/vite.svg',
      ...options,
    });
  }
  return null;
};

const ringtoneUrl = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';

let ringtoneAudio = null;

export const playRingtone = () => {
  try {
    if (!ringtoneAudio) {
      ringtoneAudio = new Audio(ringtoneUrl);
      ringtoneAudio.loop = true;
    }
    ringtoneAudio.play().catch(err => {
      console.error('Error playing ringtone:', err);
    });
  } catch (error) {
    console.error('Error initializing ringtone:', error);
  }
};

export const stopRingtone = () => {
  if (ringtoneAudio) {
    ringtoneAudio.pause();
    ringtoneAudio.currentTime = 0;
  }
};
