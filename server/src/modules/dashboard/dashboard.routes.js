const express = require("express");

const { authenticate } = require("../../middleware/authenticate");
const dashboardController = require("./dashboard.controller");

const router = express.Router();

router.use(authenticate);
router.get("/summary", dashboardController.getSummary);
router.get("/analytics", dashboardController.getAnalytics);

module.exports = router;
