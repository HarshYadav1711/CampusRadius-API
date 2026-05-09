const healthService = require("../services/health.service");
const {
  success,
  error,
  ErrorCodes,
} = require("../utils/response");

async function getHealth(req, res, next) {
  try {
    const snapshot = await healthService.getHealthSnapshot();

    if (snapshot.status === "ok") {
      return success(res, {
        message: "Service is healthy",
        statusCode: 200,
        data: {
          service: "campus-radius-api",
          uptimeSeconds: Math.round(process.uptime()),
          database: snapshot.database,
        },
      });
    }

    const context = {
      database: snapshot.database,
    };
    if (snapshot.detail) {
      context.detail = snapshot.detail;
    }

    return error(res, {
      statusCode: 503,
      code: ErrorCodes.SERVICE_UNAVAILABLE,
      message: "Database is not reachable",
      context,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getHealth,
};
