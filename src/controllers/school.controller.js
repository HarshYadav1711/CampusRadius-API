const schoolService = require("../services/school.service");
const { success } = require("../utils/response");

async function addSchool(req, res, next) {
  try {
    const { name, address, latitude, longitude } = req.body;

    const createdSchool = await schoolService.createSchool({
      name,
      address,
      latitude,
      longitude,
    });

    success(res, {
      message: "School added successfully",
      statusCode: 201,
      data: createdSchool,
    });
  } catch (err) {
    next(err);
  }
}

async function listSchools(req, res, next) {
  try {
    const userLatitude = Number(req.query.latitude);
    const userLongitude = Number(req.query.longitude);

    const sortedSchools = await schoolService.listSchoolsSortedByDistance(
      userLatitude,
      userLongitude
    );

    success(res, {
      message: "Schools retrieved successfully",
      statusCode: 200,
      data: {
        count: sortedSchools.length,
        schools: sortedSchools,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  addSchool,
  listSchools,
};
