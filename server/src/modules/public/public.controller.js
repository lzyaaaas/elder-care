const { sendSuccess } = require("../../utils/api-response");
const { asyncHandler } = require("../../utils/async-handler");
const publicService = require("./public.service");

const listEvents = asyncHandler(async (_req, res) => {
  const data = await publicService.listPublicEvents();
  return sendSuccess(res, {
    message: "Public events retrieved.",
    data,
  });
});

const createDonation = asyncHandler(async (req, res) => {
  const data = await publicService.createDonation(req.body);
  return sendSuccess(res, {
    statusCode: 201,
    message: "Public donation submitted.",
    data,
  });
});

const createFeedback = asyncHandler(async (req, res) => {
  const data = await publicService.createFeedback(req.body);
  return sendSuccess(res, {
    statusCode: 201,
    message: "Feedback submitted.",
    data,
  });
});

module.exports = { listEvents, createDonation, createFeedback };
