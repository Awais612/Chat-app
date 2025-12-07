import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:3000"
    ],
    credentials: true,
  },
});
const userSocketMap = {};

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  
  if (userId && userId !== "undefined") {
    userSocketMap[userId] = socket.id;
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("call:initiate", ({ callerId, receiverId, callType }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("call:incoming", {
        callerId,
        callType,
      });
    }
  });

  socket.on("call:accept", ({ callerId, receiverId }) => {
    const callerSocketId = getReceiverSocketId(callerId);
    if (callerSocketId) {
      io.to(callerSocketId).emit("call:accepted", { receiverId });
    }
  });

  socket.on("call:reject", ({ callerId, receiverId }) => {
    const callerSocketId = getReceiverSocketId(callerId);
    if (callerSocketId) {
      io.to(callerSocketId).emit("call:rejected", { receiverId });
    }
  });

  socket.on("call:end", ({ callerId, receiverId }) => {
    const callerSocketId = getReceiverSocketId(callerId);
    const receiverSocketId = getReceiverSocketId(receiverId);
    
    if (callerSocketId) {
      io.to(callerSocketId).emit("call:ended");
    }
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("call:ended");
    }
  });

  socket.on("call:offer", ({ offer, receiverId }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("call:offer", { offer, senderId: userId });
    }
  });

  socket.on("call:answer", ({ answer, callerId }) => {
    const callerSocketId = getReceiverSocketId(callerId);
    if (callerSocketId) {
      io.to(callerSocketId).emit("call:answer", { answer, senderId: userId });
    }
  });

  socket.on("call:ice-candidate", ({ candidate, targetId }) => {
    const targetSocketId = getReceiverSocketId(targetId);
    if (targetSocketId) {
      io.to(targetSocketId).emit("call:ice-candidate", {
        candidate,
        senderId: userId,
      });
    }
  });

  socket.on("typing:start", ({ receiverId }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing:start", { senderId: userId });
    }
  });

  socket.on("typing:stop", ({ receiverId }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing:stop", { senderId: userId });
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
