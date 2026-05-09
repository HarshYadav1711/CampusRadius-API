const { validationResult } = require("express-validator");
const response = require("../utils/response");

function formatValidationDetails(result) {
  return result.array().map((item) => ({
    field: item.path ?? item.param,
    location: item.location,
    message: item.msg,
  }));
}

function handleValidationErrors(req, res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const details = formatValidationDetails(result);
    return response.validationFailed(res, details);
  }
  next();
}

module.exports = {
  handleValidationErrors,
};
