export const formatMessageTime = (date) => {
  const now = new Date();
  const messageDate = new Date(date);
  const diffInMs = now - messageDate;
  const diffInMins = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMins < 1) return 'now';
  if (diffInMins < 60) return `${diffInMins}m`;
  if (diffInHours < 24) return `${diffInHours}h`;
  if (diffInDays < 7) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[messageDate.getDay()];
  }
  
  const month = String(messageDate.getMonth() + 1).padStart(2, '0');
  const day = String(messageDate.getDate()).padStart(2, '0');
  return `${month}/${day}`;
};

export const truncateMessage = (text, maxLength = 30) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};
