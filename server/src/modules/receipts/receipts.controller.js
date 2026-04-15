const { sendSuccess } = require("../../utils/api-response");
const { asyncHandler } = require("../../utils/async-handler");
const receiptService = require("./receipts.service");

const list = asyncHandler(async (req, res) => {
  const data = await receiptService.list(req.query);
  return sendSuccess(res, {
    message: "Receipts loaded.",
    data,
  });
});

const getById = asyncHandler(async (req, res) => {
  const data = await receiptService.getById(req.params.id);
  return sendSuccess(res, {
    message: "Receipt loaded.",
    data,
  });
});

const create = asyncHandler(async (req, res) => {
  const data = await receiptService.create(req.body);
  return sendSuccess(res, {
    statusCode: 201,
    message: "Receipt created.",
    data,
  });
});

const update = asyncHandler(async (req, res) => {
  const data = await receiptService.update(req.params.id, req.body);
  return sendSuccess(res, {
    message: "Receipt updated.",
    data,
  });
});

const remove = asyncHandler(async (req, res) => {
  const data = await receiptService.remove(req.params.id);
  return sendSuccess(res, {
    message: "Receipt deleted.",
    data,
  });
});

module.exports = { list, getById, create, update, remove };
