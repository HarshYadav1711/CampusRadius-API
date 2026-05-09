/**
 * Consistent JSON envelopes for success and error responses.
 *
 * Success: { success: true, message, data? }
 * Error:    { success: false, error: { code, message, details?, context? } }
 */

const ErrorCodes = {
  VALIDATION_FAILED: "VALIDATION_FAILED",
  NOT_FOUND: "NOT_FOUND",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
};

function success(res, { message, data, statusCode = 200 }) {
  const payload = {
    success: true,
    message,
  };

  if (data !== undefined && data !== null) {
    payload.data = data;
  }

  return res.status(statusCode).json(payload);
}

function error(res, { statusCode, code, message, details, context }) {
  const errorPayload = { code, message };

  if (Array.isArray(details) && details.length > 0) {
    errorPayload.details = details;
  }

  if (
    context !== undefined &&
    context !== null &&
    typeof context === "object" &&
    Object.keys(context).length > 0
  ) {
    errorPayload.context = context;
  }

  return res.status(statusCode).json({
    success: false,
    error: errorPayload,
  });
}

function validationFailed(res, details) {
  return error(res, {
    statusCode: 400,
    code: ErrorCodes.VALIDATION_FAILED,
    message: "Request validation failed",
    details,
  });
}

function notFound(res, message = "Resource not found") {
  return error(res, {
    statusCode: 404,
    code: ErrorCodes.NOT_FOUND,
    message,
  });
}

function internalError(res, message = "Internal server error") {
  return error(res, {
    statusCode: 500,
    code: ErrorCodes.INTERNAL_ERROR,
    message,
  });
}

module.exports = {
  success,
  error,
  validationFailed,
  notFound,
  internalError,
  ErrorCodes,
};
