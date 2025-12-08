import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    const usersWithMessageInfo = await Promise.all(
      filteredUsers.map(async (user) => {
        const lastMessage = await Message.findOne({
          $or: [
            { senderId: loggedInUserId, receiverId: user._id },
            { senderId: user._id, receiverId: loggedInUserId },
          ],
        })
          .sort({ createdAt: -1 })
          .limit(1);

        const unreadCount = await Message.countDocuments({
          senderId: user._id,
          receiverId: loggedInUserId,
          isRead: false,
        });

        return {
          ...user.toObject(),
          lastMessage: lastMessage || null,
          unreadCount,
        };
      })
    );

    usersWithMessageInfo.sort((a, b) => {
      const aTime = a.lastMessage?.createdAt || new Date(0);
      const bTime = b.lastMessage?.createdAt || new Date(0);
      return bTime - aTime;
    });

    res.status(200).json(usersWithMessageInfo);
  } catch (error) {
    console.error("Error in getUsersForSidebar controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image, audio } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    // Validate that at least one content type is provided
    if (!text && !image && !audio) {
      return res.status(400).json({ message: "Message must contain text, image, or audio" });
    }

    // Audio file size validation (5MB limit)
    if (audio) {
      const audioSizeInBytes = Math.ceil((audio.length * 3) / 4);
      const MAX_AUDIO_SIZE = 5 * 1024 * 1024; // 5MB
      
      if (audioSizeInBytes > MAX_AUDIO_SIZE) {
        return res.status(400).json({ message: "Audio file size must be less than 5MB" });
      }
    }

    let imageData;
    if (image) {
      imageData = image;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageData,
      audio,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const markMessagesAsRead = async (req, res) => {
  try {
    const { id: otherUserId } = req.params;
    const myId = req.user._id;

    const result = await Message.updateMany(
      {
        senderId: otherUserId,
        receiverId: myId,
        isRead: false,
      },
      {
        isRead: true,
      }
    );

    const senderSocketId = getReceiverSocketId(otherUserId);
    if (senderSocketId && result.modifiedCount > 0) {
      io.to(senderSocketId).emit("messages:read", { 
        readBy: myId.toString(),
        senderId: otherUserId.toString()
      });
    }

    res.status(200).json({ message: "Messages marked as read" });
  } catch (error) {
    console.log("Error in markMessagesAsRead controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
