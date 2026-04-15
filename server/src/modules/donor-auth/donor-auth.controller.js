const { sendSuccess } = require("../../utils/api-response");
const { asyncHandler } = require("../../utils/async-handler");
const donorAuthService = require("./donor-auth.service");

const register = asyncHandler(async (req, res) => {
  const data = await donorAuthService.register(req.body);
  return sendSuccess(res, {
    statusCode: 201,
    message: "Donor account created.",
    data,
  });
});

const login = asyncHandler(async (req, res) => {
  const data = await donorAuthService.login(req.body);
  return sendSuccess(res, {
    message: "Donor login successful.",
    data,
  });
});

const getMe = asyncHandler(async (req, res) => {
  const data = await donorAuthService.getCurrentDonor(req.user.id);
  return sendSuccess(res, {
    message: "Donor profile retrieved.",
    data,
  });
});

module.exports = { register, login, getMe };
