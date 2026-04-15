const { sendSuccess } = require("../../utils/api-response");
const { asyncHandler } = require("../../utils/async-handler");
const dashboardService = require("./dashboard.service");

const getSummary = asyncHandler(async (_req, res) => {
  const data = await dashboardService.getSummary();
  return sendSuccess(res, {
    message: "Dashboard summary loaded.",
    data,
  });
});

const getAnalytics = asyncHandler(async (_req, res) => {
  const data = await dashboardService.getAnalytics();
  return sendSuccess(res, {
    message: "Dashboard analytics loaded.",
    data,
  });
});

module.exports = { getSummary, getAnalytics };
