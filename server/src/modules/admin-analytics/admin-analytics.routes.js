const express = require("express");

const { authenticate } = require("../../middleware/authenticate");
const { validate } = require("../../middleware/validate");
const {
  adminAnalyticsParamsSchema,
  adminAnalyticsQuerySchema,
} = require("../../validators/admin-analytics.validators");
const adminAnalyticsController = require("./admin-analytics.controller");

const router = express.Router();

router.use(authenticate);
router.get("/:moduleKey/metadata", validate({ params: adminAnalyticsParamsSchema }), adminAnalyticsController.getMetadata);
router.post(
  "/:moduleKey/query",
  validate({ params: adminAnalyticsParamsSchema, body: adminAnalyticsQuerySchema }),
  adminAnalyticsController.query,
);

module.exports = router;
