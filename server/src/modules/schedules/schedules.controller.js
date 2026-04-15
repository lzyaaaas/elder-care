const { sendSuccess } = require("../../utils/api-response");
const { asyncHandler } = require("../../utils/async-handler");
const scheduleService = require("./schedules.service");

const list = asyncHandler(async (req, res) => {
  const data = await scheduleService.list(req.query);
  return sendSuccess(res, {
    message: "Schedules retrieved.",
    data,
  });
});

const getById = asyncHandler(async (req, res) => {
  const data = await scheduleService.getById(req.params.id);
  return sendSuccess(res, {
    message: "Schedule retrieved.",
    data,
  });
});

const create = asyncHandler(async (req, res) => {
  const data = await scheduleService.create(req.body);
  return sendSuccess(res, {
    statusCode: 201,
    message: "Schedule created.",
    data,
  });
});

const update = asyncHandler(async (req, res) => {
  const data = await scheduleService.update(req.params.id, req.body);
  return sendSuccess(res, {
    message: "Schedule updated.",
    data,
  });
});

const remove = asyncHandler(async (req, res) => {
  const data = await scheduleService.remove(req.params.id);
  return sendSuccess(res, {
    message: "Schedule deleted.",
    data,
  });
});

module.exports = { list, getById, create, update, remove };
