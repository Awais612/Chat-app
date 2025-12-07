import {
  isValidEmail,
  isValidPassword,
  isValidName,
  isEmpty,
} from "./validation.helpers.js";

export const validateSignup = (data) => {
  const errors = [];
  const { fullName, email, password } = data;

  if (isEmpty(fullName)) {
    errors.push({
      field: "fullName",
      message: "Full name is required",
    });
  } else if (!isValidName(fullName)) {
    errors.push({
      field: "fullName",
      message: "Full name must contain only letters and spaces, minimum 2 characters",
    });
  }

  if (isEmpty(email)) {
    errors.push({
      field: "email",
      message: "Email is required",
    });
  } else if (!isValidEmail(email)) {
    errors.push({
      field: "email",
      message: "Invalid email format",
    });
  }

  if (isEmpty(password)) {
    errors.push({
      field: "password",
      message: "Password is required",
    });
  } else if (!isValidPassword(password)) {
    errors.push({
      field: "password",
      message: "Password must be at least 8 characters long",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateLogin = (data) => {
  const errors = [];
  const { email, password } = data;

  if (isEmpty(email)) {
    errors.push({
      field: "email",
      message: "Email is required",
    });
  } else if (!isValidEmail(email)) {
    errors.push({
      field: "email",
      message: "Invalid email format",
    });
  }

  if (isEmpty(password)) {
    errors.push({
      field: "password",
      message: "Password is required",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateProfileUpdate = (data) => {
  const errors = [];
  const { profilePic } = data;

  if (!profilePic) {
    errors.push({
      field: "profilePic",
      message: "Profile picture is required",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
