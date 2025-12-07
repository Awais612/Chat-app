# 💬 Real-Time Chat Application

A feature-rich, modern chat application built with the MERN stack, featuring real-time messaging, audio/video calling, and WhatsApp-like functionality.

![Chat App](https://img.shields.io/badge/MERN-Stack-green)
![Socket.IO](https://img.shields.io/badge/Socket.IO-Real--time-blue)
![WebRTC](https://img.shields.io/badge/WebRTC-Video%20Calls-red)

## ✨ Features

### 💬 Messaging
- **Real-time messaging** with Socket.IO
- **Typing indicators** - See when someone is typing
- **Read receipts** - WhatsApp-style blue checkmarks (✓✓)
- **Message status** - Sent, delivered, and read indicators
- **Emoji picker** - Express yourself with emojis
- **File sharing** - Send images and videos (Base64 storage)
- **Last message preview** - See recent messages in sidebar
- **Unread count badges** - Track unread messages

### 📞 Audio/Video Calling
- **WebRTC integration** - Peer-to-peer calling
- **Video calls** - High-quality video communication
- **Audio calls** - Crystal-clear voice calls
- **Call controls** - Mute, video toggle, end call
- **Ringtone alerts** - Get notified of incoming calls
- **Browser notifications** - Desktop notifications for calls

### 👤 User Features
- **Authentication** - Secure JWT-based auth
- **Profile management** - Update profile pictures
- **Online status** - See who's online in real-time
- **User search** - Find users quickly
- **Auto-sort conversations** - Most recent messages first

### 🎨 UI/UX
- **WhatsApp-like interface** - Familiar and intuitive
- **Responsive design** - Works on all devices
- **Material-UI components** - Modern and polished
- **Real-time updates** - Instant synchronization
- **Loading states** - Smooth user experience

## 🛠️ Tech Stack

### Frontend
- **React** - UI library
- **Vite** - Build tool
- **Zustand** - State management
- **Material-UI** - Component library
- **Socket.IO Client** - Real-time communication
- **WebRTC** - Video/audio calling
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **Emoji Picker React** - Emoji selection

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Socket.IO** - WebSocket server
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **cookie-parser** - Cookie handling

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd chat-app
```

2. **Install backend dependencies**
```bash
cd backend
npm install
```

3. **Install frontend dependencies**
```bash
cd ../frontend
npm install
```

4. **Environment Setup**

Create `.env` in the `backend` directory:
```env
PORT=5500
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
NODE_ENV=development
```

Create `.env` in the `frontend` directory:
```env
VITE_API_URL=http://localhost:5500
```

5. **Start the application**

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

6. **Open your browser**
```
http://localhost:5173
```

## 📁 Project Structure

```
chat-app/
├── backend/
│   ├── controllers/        # Request handlers
│   ├── lib/               # Utilities (socket, db)
│   ├── middleware/        # Auth middleware
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   └── src/
│       └── server.js      # Entry point
├── frontend/
│   ├── public/            # Static assets
│   └── src/
│       ├── components/    # React components
│       ├── lib/           # Utilities
│       ├── pages/         # Page components
│       └── store/         # Zustand stores
└── README.md
```

## 🎯 Key Features Explained

### Read Receipts
Messages show status with checkmarks:
- **✓** (Gray) - Sent to server
- **✓✓** (Gray) - Delivered
- **✓✓** (Blue) - Read by recipient

### Typing Indicators
- Real-time "typing..." indicator in chat header
- Animated dots in message list
- Auto-stops after 2 seconds of inactivity

### File Sharing
- **Images**: Max 5MB
- **Videos**: Max 10MB
- Stored as Base64 in MongoDB
- Preview before sending
- Auto-validation with toast notifications

### Audio/Video Calling
- Uses Google STUN servers for WebRTC
- P2P connection for efficient streaming
- Socket.IO for call signaling
- Ringtone and notifications for incoming calls

## 🔒 Security Features

- JWT-based authentication
- HTTP-only cookies
- Password hashing with bcryptjs
- CORS protection
- Environment variable protection

## 📱 Responsive Design

The application is fully responsive and works seamlessly on:
- Desktop (1920px and above)
- Laptop (1024px - 1919px)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🐛 Known Issues & Limitations

- WebRTC may require TURN servers for NAT traversal in production
- Base64 storage has size limitations (MongoDB 16MB document limit)
- Browser permissions required for camera/microphone access

## 🚧 Future Enhancements

- [ ] Group chats
- [ ] Message deletion
- [ ] Message editing
- [ ] Voice messages
- [ ] Screen sharing
- [ ] File attachments (documents)
- [ ] Message reactions
- [ ] Dark mode
- [ ] Message search
- [ ] Call history

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Built with ❤️ using the MERN stack

## 🙏 Acknowledgments

- Socket.IO for real-time communication
- WebRTC for video/audio calling
- Material-UI for beautiful components
- MongoDB for flexible data storage

---

**Happy Chatting! 💬**
