# Using Serializers in Chat App Backend

## Overview

The serializers provide a consistent way to format API responses and errors across all endpoints.

## Success Response Format

All successful responses follow this structure:
```json
{
  "status": "success",
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

## Error Response Format

All error responses follow this structure:
```json
{
  "status": "error",
  "message": "Error description",
  "errors": [ /* optional validation errors */ ]
}
```

## Available Serializers

### Success Responses

```javascript
import {
  successResponse,   // Custom status code
  createdResponse,   // 201 - Resource created
  okResponse,        // 200 - Success
  noContentResponse  // 204 - No content
} from "../serializers/index.js";
```

### Error Responses

```javascript
import {
  errorResponse,         // Custom status code
  badRequestError,       // 400 - Bad request
  unauthorizedError,     // 401 - Unauthorized
  forbiddenError,        // 403 - Forbidden
  notFoundError,         // 404 - Not found
  conflictError,         // 409 - Conflict
  internalServerError,   // 500 - Server error
  validationError        // 400 - Validation errors
} from "../serializers/index.js";
```

## Usage Examples

### Example 1: Update Signup Controller

**Before:**
```javascript
export const signup = async (req, res) => {
  try {
    // ... validation and user creation
    res.status(201).json({
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      profilePic: newUser.profilePic,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
```

**After:**
```javascript
import { createdResponse, badRequestError, conflictError, internalServerError } from "../serializers/index.js";

export const signup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Validation
    if (!fullName || !email || !password) {
      return badRequestError(res, "All fields are required");
    }

    if (password.length < 8) {
      return badRequestError(res, "Password must be at least 8 characters long");
    }

    // Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return conflictError(res, "Email already exists");
    }

    // Create user
    const newUser = new User({ fullName, email, password });
    await newUser.save();

    generateToken(newUser._id, res);

    return createdResponse(res, {
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      profilePic: newUser.profilePic,
    }, "User registered successfully");

  } catch (error) {
    console.log("Error in signup controller:", error.message);
    return internalServerError(res, "Failed to create user account");
  }
};
```

### Example 2: Update Login Controller

```javascript
import { okResponse, badRequestError, unauthorizedError, internalServerError } from "../serializers/index.js";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return badRequestError(res, "Email and password are required");
    }

    const user = await User.findOne({ email });
    if (!user) {
      return unauthorizedError(res, "Invalid email or password");
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return unauthorizedError(res, "Invalid email or password");
    }

    generateToken(user._id, res);

    return okResponse(res, {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    }, "Login successful");

  } catch (error) {
    console.log("Error in login controller:", error.message);
    return internalServerError(res, "Login failed");
  }
};
```

### Example 3: Update Message Controller

```javascript
import { okResponse, createdResponse, notFoundError, internalServerError } from "../serializers/index.js";

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return notFoundError(res, "Receiver not found");
    }

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    return createdResponse(res, newMessage, "Message sent successfully");

  } catch (error) {
    console.log("Error in sendMessage controller:", error.message);
    return internalServerError(res, "Failed to send message");
  }
};
```

### Example 4: Validation Errors

```javascript
import { validationError } from "../serializers/index.js";

// With express-validator or manual validation
const errors = [
  { field: "email", message: "Invalid email format" },
  { field: "password", message: "Password too weak" }
];

return validationError(res, errors);

// Response:
// {
//   "status": "error",
//   "message": "Validation failed",
//   "errors": [
//     { "field": "email", "message": "Invalid email format" },
//     { "field": "password", "message": "Password too weak" }
//   ]
// }
```

### Example 5: Auth Middleware

```javascript
import { unauthorizedError, notFoundError, internalServerError } from "../serializers/index.js";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return unauthorizedError(res, "No token provided");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return unauthorizedError(res, "Invalid token");
    }

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return notFoundError(res, "User not found");
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("Error in protectRoute middleware:", error.message);
    return internalServerError(res);
  }
};
```

## Benefits

1. **Consistency**: All responses follow the same structure
2. **Readability**: Clear, semantic function names
3. **Maintainability**: Easy to update response format globally
4. **Type Safety**: Can be extended with TypeScript interfaces
5. **Documentation**: Self-documenting code

## Quick Reference

| Function | Status | Use Case |
|----------|--------|----------|
| `createdResponse` | 201 | Resource created (signup, send message) |
| `okResponse` | 200 | Success (login, get data) |
| `noContentResponse` | 204 | Success with no data (delete) |
| `badRequestError` | 400 | Invalid input, validation errors |
| `unauthorizedError` | 401 | Authentication required/failed |
| `forbiddenError` | 403 | No permission |
| `notFoundError` | 404 | Resource doesn't exist |
| `conflictError` | 409 | Duplicate resource |
| `internalServerError` | 500 | Unexpected errors |
| `validationError` | 400 | Multiple validation errors |
