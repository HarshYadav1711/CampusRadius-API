const express = require("express");

const healthRoutes = require("./health.routes");
const schoolRoutes = require("./school.routes");

const router = express.Router();

router.use(healthRoutes);
router.use(schoolRoutes);

module.exports = router;
