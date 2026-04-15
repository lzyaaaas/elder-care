const { sendSuccess } = require("../../utils/api-response");
const { asyncHandler } = require("../../utils/async-handler");
const employeePortalService = require("./employee-portal.service");

const getDashboard = asyncHandler(async (req, res) => {
  const data = await employeePortalService.getDashboard(req.user.id);
  return sendSuccess(res, {
    message: "Employee dashboard retrieved.",
    data,
  });
});

const getMe = asyncHandler(async (req, res) => {
  const data = await employeePortalService.getMe(req.user.id);
  return sendSuccess(res, {
    message: "Employee profile retrieved.",
    data,
  });
});

const updateMe = asyncHandler(async (req, res) => {
  const data = await employeePortalService.updateMe(req.user.id, req.body);
  return sendSuccess(res, {
    message: "Employee profile updated.",
    data,
  });
});

const updatePassword = asyncHandler(async (req, res) => {
  const data = await employeePortalService.updatePassword(req.user.id, req.body);
  return sendSuccess(res, {
    message: "Employee password updated.",
    data,
  });
});

const listSchedule = asyncHandler(async (req, res) => {
  const data = await employeePortalService.listSchedule(req.user.id, req.query);
  return sendSuccess(res, {
    message: "Employee schedule retrieved.",
    data,
  });
});

const getScheduleById = asyncHandler(async (req, res) => {
  const data = await employeePortalService.getScheduleById(req.user.id, req.params.id);
  return sendSuccess(res, {
    message: "Employee schedule detail retrieved.",
    data,
  });
});

const listEvents = asyncHandler(async (req, res) => {
  const data = await employeePortalService.listEvents(req.user.id);
  return sendSuccess(res, {
    message: "Employee events retrieved.",
    data,
  });
});

const listDonations = asyncHandler(async (req, res) => {
  const data = await employeePortalService.listDonations(req.user.id);
  return sendSuccess(res, {
    message: "Employee donation tasks retrieved.",
    data,
  });
});

const listShippingTasks = asyncHandler(async (req, res) => {
  const data = await employeePortalService.listShippingTasks(req.user.id);
  return sendSuccess(res, {
    message: "Employee shipping tasks retrieved.",
    data,
  });
});

const listFollowUps = asyncHandler(async (req, res) => {
  const data = await employeePortalService.listFollowUps(req.user.id);
  return sendSuccess(res, {
    message: "Employee follow-up feedback retrieved.",
    data,
  });
});

module.exports = {
  getDashboard,
  getMe,
  updateMe,
  updatePassword,
  listSchedule,
  getScheduleById,
  listEvents,
  listDonations,
  listShippingTasks,
  listFollowUps,
};
