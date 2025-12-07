export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPassword = (password) => {
  return password && password.length >= 8;
};

export const isStrongPassword = (password) => {
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return strongPasswordRegex.test(password);
};

export const isValidName = (name) => {
  const nameRegex = /^[a-zA-Z\s]+$/;
  return name && nameRegex.test(name) && name.trim().length >= 2;
};

export const isValidObjectId = (id) => {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
};

export const isEmpty = (str) => {
  return !str || str.trim().length === 0;
};

export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isValidBase64Image = (str) => {
  const base64Regex = /^data:image\/(png|jpg|jpeg|gif|webp);base64,/;
  return base64Regex.test(str);
};
