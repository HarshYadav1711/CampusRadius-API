const schoolService = require("../services/school.service");
const response = require("../utils/response");

async function addSchool(req, res, next) {
  try {
    const { name, address, latitude, longitude } = req.body;
    const data = await schoolService.createSchool({
      name,
      address,
      latitude,
      longitude,
    });

    response.success(res, data, {
      status: 201,
      message: "School added successfully",
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  addSchool,
};
