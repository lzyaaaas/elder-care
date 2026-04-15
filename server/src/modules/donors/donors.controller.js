const { sendSuccess } = require("../../utils/api-response");
const { asyncHandler } = require("../../utils/async-handler");
const donorService = require("./donors.service");

const list = asyncHandler(async (req, res) => {
  const data = await donorService.list(req.query);
  return sendSuccess(res, {
    message: "Donors loaded.",
    data,
  });
});

const getById = asyncHandler(async (req, res) => {
  const data = await donorService.getById(req.params.id);
  return sendSuccess(res, {
    message: "Donor loaded.",
    data,
  });
});

const create = asyncHandler(async (req, res) => {
  const data = await donorService.create(req.body);
  return sendSuccess(res, {
    statusCode: 201,
    message: "Donor created.",
    data,
  });
});

const update = asyncHandler(async (req, res) => {
  const data = await donorService.update(req.params.id, req.body);
  return sendSuccess(res, {
    message: "Donor updated.",
    data,
  });
});

const remove = asyncHandler(async (req, res) => {
  const data = await donorService.remove(req.params.id);
  return sendSuccess(res, {
    message: "Donor deleted.",
    data,
  });
});

module.exports = { list, getById, create, update, remove };
