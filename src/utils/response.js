/**
 * Small JSON helpers so controllers stay thin and payloads stay consistent.
 */

function success(res, data = null, meta = {}) {
  const body = { success: true, ...meta };
  if (data !== null && data !== undefined) body.data = data;
  const status = meta.status ?? 200;
  delete body.status;
  return res.status(status).json(body);
}

function fail(res, message, status = 400, errors = undefined) {
  const body = { success: false, message };
  if (errors !== undefined) body.errors = errors;
  return res.status(status).json(body);
}

function notFound(res, message = "Not found") {
  return fail(res, message, 404);
}

function serverError(res, message = "Internal server error") {
  return fail(res, message, 500);
}

module.exports = {
  success,
  fail,
  notFound,
  serverError,
};
