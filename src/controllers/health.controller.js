const healthService = require("../services/health.service");
const response = require("../utils/response");

async function getHealth(req, res, next) {
  try {
    const snapshot = await healthService.getHealthSnapshot();
    const httpStatus = snapshot.status === "ok" ? 200 : 503;

    response.success(
      res,
      {
        service: "campus-radius-api",
        uptimeSeconds: Math.round(process.uptime()),
        ...snapshot,
      },
      { status: httpStatus }
    );
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getHealth,
};
