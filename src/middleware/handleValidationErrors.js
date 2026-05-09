const { validationResult } = require("express-validator");
const response = require("../utils/response");

function handleValidationErrors(req, res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const errors = result.array().map((e) => e.msg);
    return response.fail(res, "Validation failed", 400, errors);
  }
  next();
}

module.exports = {
  handleValidationErrors,
};
