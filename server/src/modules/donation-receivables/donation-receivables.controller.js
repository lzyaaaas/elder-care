const { sendSuccess } = require("../../utils/api-response");
const { asyncHandler } = require("../../utils/async-handler");
const donationReceivableService = require("./donation-receivables.service");

const list = asyncHandler(async (req, res) => {
  const data = await donationReceivableService.list(req.query);
  return sendSuccess(res, {
    message: "Donation receivables loaded.",
    data,
  });
});

const getById = asyncHandler(async (req, res) => {
  const data = await donationReceivableService.getById(req.params.id);
  return sendSuccess(res, {
    message: "Donation receivable loaded.",
    data,
  });
});

const create = asyncHandler(async (req, res) => {
  const data = await donationReceivableService.create(req.body);
  return sendSuccess(res, {
    statusCode: 201,
    message: "Donation receivable created.",
    data,
  });
});

const update = asyncHandler(async (req, res) => {
  const data = await donationReceivableService.update(req.params.id, req.body);
  return sendSuccess(res, {
    message: "Donation receivable updated.",
    data,
  });
});

const remove = asyncHandler(async (req, res) => {
  const data = await donationReceivableService.remove(req.params.id);
  return sendSuccess(res, {
    message: "Donation receivable deleted.",
    data,
  });
});

module.exports = { list, getById, create, update, remove };
