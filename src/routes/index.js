const express = require("express");

const { success } = require("../utils/response");
const docsRoutes = require("./docs.routes");
const healthRoutes = require("./health.routes");
const schoolRoutes = require("./school.routes");

const router = express.Router();

router.get("/", (req, res) => {
  success(res, {
    message: "CampusRadius API",
    data: {
      endpoints: {
        health: "GET /health",
        addSchool: "POST /addSchool",
        listSchools: "GET /listSchools?latitude=<number>&longitude=<number>",
        docs: "GET /api/docs",
      },
    },
  });
});

router.use(docsRoutes);
router.use(healthRoutes);
router.use(schoolRoutes);

module.exports = router;
