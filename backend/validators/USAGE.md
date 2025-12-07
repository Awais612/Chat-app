# Using Validators in Chat App Backend

## Overview

The validators provide a consistent way to validate incoming request data before processing. They integrate seamlessly with the serializers for error responses.

## Validation Flow

```
Request → Validation Middleware → Controller
                ↓ (if invalid)
          Error Serializer → Error Response
```

## Available Validators

### Auth Validators
- `validateSignup(data)` - Validates signup requests
- `validateLogin(data)` - Validates login requests
- `validateProfileUpdate(data)` - Validates profile updates

### Message Validators
- `validateSendMessage(data, params)` - Validates message sending
- `validateGetMessages(params)` - Validates message retrieval

### Validation Helpers
- `isValidEmail(email)` - Email format validation
- `isValidPassword(password)` - Password length validation
- `isValidName(name)` - Name format validation
- `isValidObjectId(id)` - MongoDB ObjectId validation
- `isEmpty(str)` - Empty string check
- `isValidUrl(url)` - URL validation
- `isValidBase64Image(str)` - Base64 image validation

## Usage Examples

### Example 1: Using Validation Middleware in Routes

```javascript
import express from "express";
import { signup, login } from "../controllers/auth.controller.js";
import { validate, validateSignup, validateLogin } from "../validators/index.js";

const router = express.Router();

// Apply validation middleware before controller
router.post("/signup", validate(validateSignup), signup);
router.post("/login", validate(validateLogin), login);

export default router;
```

### Example 2: Update Auth Routes with Validation

**`routes/auth.route.js`**
```javascript
import express from "express";
import {
  signup,
  login,
  logout,
  updateProfile,
  checkAuth,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  validate,
  validateSignup,
  validateLogin,
  validateProfileUpdate,
} from "../validators/index.js";

const router = express.Router();

router.post("/signup", validate(validateSignup), signup);
router.post("/login", validate(validateLogin), login);
router.post("/logout", logout);
router.put("/update-profile", protectRoute, validate(validateProfileUpdate), updateProfile);
router.get("/check", protectRoute, checkAuth);

export default router;
```

### Example 3: Update Message Routes with Validation

**`routes/message.route.js`**
```javascript
import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getUsersForSidebar,
  getMessages,
  sendMessage,
} from "../controllers/message.controller.js";
import {
  validate,
  validateSendMessage,
  validateGetMessages,
} from "../validators/index.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, validate(validateGetMessages, "params"), getMessages);
router.post("/send/:id", protectRoute, validate(validateSendMessage, "all"), sendMessage);

export default router;
```

### Example 4: Simplified Controllers

With validators in routes, controllers can be simplified:

**Before:**
```javascript
export const signup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Manual validation
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 8) {
      return res.status(400).json({ 
        message: "Password must be at least 8 characters long" 
      });
    }

    // ... rest of logic
  } catch (error) {
    // error handling
  }
};
```

**After:**
```javascript
import { createdResponse, conflictError, internalServerError } from "../serializers/index.js";

export const signup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    
    // No need for manual validation - already validated by middleware!
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return conflictError(res, "Email already exists");
    }

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

### Example 5: Custom Validator

Create your own validator following the pattern:

```javascript
// validators/custom.validator.js
import { isEmpty, isValidEmail } from "./validation.helpers.js";

export const validateCustom = (data) => {
  const errors = [];

  if (isEmpty(data.field1)) {
    errors.push({
      field: "field1",
      message: "Field 1 is required",
    });
  }

  // Add more validations...

  return {
    isValid: errors.length === 0,
    errors,
  };
};
```

### Example 6: Validation Error Response

When validation fails, the middleware automatically returns:

```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters long"
    }
  ]
}
```

## Validation Rules

### Signup Validation
- **fullName**: Required, only letters and spaces, min 2 characters
- **email**: Required, valid email format
- **password**: Required, min 8 characters

### Login Validation
- **email**: Required, valid email format
- **password**: Required

### Send Message Validation
- **receiverId**: Required, valid MongoDB ObjectId
- **text OR image**: At least one required
- **text**: Max 5000 characters if provided

### Get Messages Validation
- **userId**: Required (in params), valid MongoDB ObjectId

## Integration with Serializers

Validators work seamlessly with serializers:

1. **Validation middleware** runs first
2. If validation fails → **validationError serializer** sends formatted error
3. If validation passes → Request proceeds to **controller**
4. Controller uses **success serializers** for responses

## Benefits

1. **Separation of Concerns**: Validation logic separate from business logic
2. **Reusability**: Validators can be reused across routes
3. **Consistency**: All validation errors follow same format
4. **Maintainability**: Easy to update validation rules
5. **Clean Controllers**: Controllers focus on business logic, not validation
6. **Type Safety**: Can be extended with TypeScript

## Quick Reference

| Validator | Validates | Fields Checked |
|-----------|-----------|----------------|
| `validateSignup` | User registration | fullName, email, password |
| `validateLogin` | User login | email, password |
| `validateProfileUpdate` | Profile update | profilePic |
| `validateSendMessage` | Send message | receiverId, text/image, length |
| `validateGetMessages` | Get messages | userId (ObjectId) |

## Middleware Options

```javascript
// Validate body (default)
validate(validatorFn)

// Validate params
validate(validatorFn, "params")

// Validate query
validate(validatorFn, "query")

// Validate all (body + params + query)
validate(validatorFn, "all")

// Combine multiple validators
validateAll(validator1, validator2, validator3)
```
