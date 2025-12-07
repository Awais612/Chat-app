import { isEmpty, isValidObjectId } from "./validation.helpers.js";

export const validateSendMessage = (data, params) => {
  const errors = [];
  const { text, image } = data;
  const { id: receiverId } = params;

  if (!receiverId) {
    errors.push({
      field: "receiverId",
      message: "Receiver ID is required",
    });
  } else if (!isValidObjectId(receiverId)) {
    errors.push({
      field: "receiverId",
      message: "Invalid receiver ID format",
    });
  }

  if (isEmpty(text) && !image) {
    errors.push({
      field: "content",
      message: "Message must contain either text or image",
    });
  }

  if (text && text.trim().length > 5000) {
    errors.push({
      field: "text",
      message: "Message text cannot exceed 5000 characters",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateGetMessages = (params) => {
  const errors = [];
  const { id: userId } = params;

  if (!userId) {
    errors.push({
      field: "userId",
      message: "User ID is required",
    });
  } else if (!isValidObjectId(userId)) {
    errors.push({
      field: "userId",
      message: "Invalid user ID format",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
