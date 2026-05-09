const express = require("express");

const schoolController = require("../controllers/school.controller");
const {
  addSchoolValidators,
  handleValidationErrors,
} = require("../middleware/validateAddSchool");

const router = express.Router();

router.post(
  "/addSchool",
  addSchoolValidators,
  handleValidationErrors,
  schoolController.addSchool
);

module.exports = router;
