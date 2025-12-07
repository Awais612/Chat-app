export const errorResponse = (res, statusCode, message, errors = null) => {
  const response = {
    status: "error",
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

export const badRequestError = (res, message = "Bad request", errors = null) => {
  return errorResponse(res, 400, message, errors);
};

export const unauthorizedError = (res, message = "Unauthorized access") => {
  return errorResponse(res, 401, message);
};

export const forbiddenError = (res, message = "Forbidden") => {
  return errorResponse(res, 403, message);
};

export const notFoundError = (res, message = "Resource not found") => {
  return errorResponse(res, 404, message);
};

export const conflictError = (res, message = "Resource already exists") => {
  return errorResponse(res, 409, message);
};

export const internalServerError = (res, message = "Internal server error") => {
  return errorResponse(res, 500, message);
};

export const validationError = (res, errors) => {
  const formattedErrors = errors.map((err) => ({
    field: err.field || err.param,
    message: err.message || err.msg,
  }));

  return badRequestError(res, "Validation failed", formattedErrors);
};
