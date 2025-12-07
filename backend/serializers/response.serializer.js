export const successResponse = (res, statusCode, data, message = "Success") => {
  return res.status(statusCode).json({
    status: "success",
    message,
    data,
  });
};

export const createdResponse = (res, data, message = "Resource created successfully") => {
  return successResponse(res, 201, data, message);
};

export const okResponse = (res, data, message = "Operation successful") => {
  return successResponse(res, 200, data, message);
};

export const noContentResponse = (res) => {
  return res.status(204).send();
};
