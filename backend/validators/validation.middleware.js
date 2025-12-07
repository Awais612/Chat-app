import { validationError } from "../serializers/index.js";

export const validate = (validatorFn, source = "body") => {
  return (req, res, next) => {
    let dataToValidate;

    switch (source) {
      case "body":
        dataToValidate = req.body;
        break;
      case "params":
        dataToValidate = req.params;
        break;
      case "query":
        dataToValidate = req.query;
        break;
      case "all":
        dataToValidate = { body: req.body, params: req.params, query: req.query };
        break;
      default:
        dataToValidate = req.body;
    }

    const validation = validatorFn(dataToValidate, req.params);

    if (!validation.isValid) {
      return validationError(res, validation.errors);
    }

    next();
  };
};

export const validateAll = (...validatorFns) => {
  return (req, res, next) => {
    const allErrors = [];

    for (const validatorFn of validatorFns) {
      const validation = validatorFn(req.body, req.params, req.query);
      if (!validation.isValid) {
        allErrors.push(...validation.errors);
      }
    }

    if (allErrors.length > 0) {
      return validationError(res, allErrors);
    }

    next();
  };
};
