const { sendSuccess } = require("../../utils/api-response");
const { asyncHandler } = require("../../utils/async-handler");
const feedbackService = require("./feedback.service");

const list = asyncHandler(async (req, res) => {
  const data = await feedbackService.list(req.query);
  return sendSuccess(res, {
    message: "Feedback records loaded.",
    data,
  });
});

const getById = asyncHandler(async (req, res) => {
  const data = await feedbackService.getById(req.params.id);
  return sendSuccess(res, {
    message: "Feedback record loaded.",
    data,
  });
});

const create = asyncHandler(async (req, res) => {
  const data = await feedbackService.create(req.body);
  return sendSuccess(res, {
    statusCode: 201,
    message: "Feedback record created.",
    data,
  });
});

const update = asyncHandler(async (req, res) => {
  const data = await feedbackService.update(req.params.id, req.body);
  return sendSuccess(res, {
    message: "Feedback record updated.",
    data,
  });
});

const remove = asyncHandler(async (req, res) => {
  const data = await feedbackService.remove(req.params.id);
  return sendSuccess(res, {
    message: "Feedback record deleted.",
    data,
  });
});

module.exports = { list, getById, create, update, remove };
