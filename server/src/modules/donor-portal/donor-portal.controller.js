const { sendSuccess } = require("../../utils/api-response");
const { asyncHandler } = require("../../utils/async-handler");
const donorPortalService = require("./donor-portal.service");

const getProfile = asyncHandler(async (req, res) => {
  const data = await donorPortalService.getProfile(req.user.id);
  return sendSuccess(res, {
    message: "Donor profile retrieved.",
    data,
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const data = await donorPortalService.updateProfile(req.user.id, req.body);
  return sendSuccess(res, {
    message: "Donor profile updated.",
    data,
  });
});

const listDonations = asyncHandler(async (req, res) => {
  const data = await donorPortalService.listDonations(req.user.id);
  return sendSuccess(res, {
    message: "Donor donations retrieved.",
    data,
  });
});

const listReceipts = asyncHandler(async (req, res) => {
  const data = await donorPortalService.listReceipts(req.user.id);
  return sendSuccess(res, {
    message: "Donor receipts retrieved.",
    data,
  });
});

const listShipping = asyncHandler(async (req, res) => {
  const data = await donorPortalService.listShipping(req.user.id);
  return sendSuccess(res, {
    message: "Donor shipping records retrieved.",
    data,
  });
});

const listFeedback = asyncHandler(async (req, res) => {
  const data = await donorPortalService.listFeedback(req.user.id);
  return sendSuccess(res, {
    message: "Donor feedback retrieved.",
    data,
  });
});

const createFeedback = asyncHandler(async (req, res) => {
  const data = await donorPortalService.createFeedback(req.user.id, req.body);
  return sendSuccess(res, {
    statusCode: 201,
    message: "Donor feedback submitted.",
    data,
  });
});

module.exports = {
  getProfile,
  updateProfile,
  listDonations,
  listReceipts,
  listShipping,
  listFeedback,
  createFeedback,
};
