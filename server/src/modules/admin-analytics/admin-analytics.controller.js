const { sendSuccess } = require("../../utils/api-response");
const { asyncHandler } = require("../../utils/async-handler");
const adminAnalyticsService = require("./admin-analytics.service");

const getMetadata = asyncHandler(async (req, res) => {
  const data = await adminAnalyticsService.getMetadata(req.params.moduleKey);
  return sendSuccess(res, {
    message: "Analytics metadata loaded.",
    data,
  });
});

const query = asyncHandler(async (req, res) => {
  const data = await adminAnalyticsService.query(req.params.moduleKey, req.body.filters);
  return sendSuccess(res, {
    message: "Analytics results loaded.",
    data,
  });
});

module.exports = { getMetadata, query };
