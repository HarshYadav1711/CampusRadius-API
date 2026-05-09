const express = require("express");

const schoolController = require("../controllers/school.controller");
const { handleValidationErrors } = require("../middleware/handleValidationErrors");
const {
  addSchoolValidators,
} = require("../middleware/validateAddSchool");
const { listSchoolsValidators } = require("../middleware/validateListSchools");

const router = express.Router();

router.post(
  "/addSchool",
  addSchoolValidators,
  handleValidationErrors,
  schoolController.addSchool
);

router.get(
  "/listSchools",
  listSchoolsValidators,
  handleValidationErrors,
  schoolController.listSchools
);

module.exports = router;
