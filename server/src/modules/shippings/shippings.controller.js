const { sendSuccess } = require("../../utils/api-response");
const { asyncHandler } = require("../../utils/async-handler");
const shippingService = require("./shippings.service");

const list = asyncHandler(async (req, res) => {
  const data = await shippingService.list(req.query);
  return sendSuccess(res, {
    message: "Shipping records loaded.",
    data,
  });
});

const getById = asyncHandler(async (req, res) => {
  const data = await shippingService.getById(req.params.id);
  return sendSuccess(res, {
    message: "Shipping record loaded.",
    data,
  });
});

const create = asyncHandler(async (req, res) => {
  const data = await shippingService.create(req.body);
  return sendSuccess(res, {
    statusCode: 201,
    message: "Shipping record created.",
    data,
  });
});

const update = asyncHandler(async (req, res) => {
  const data = await shippingService.update(req.params.id, req.body);
  return sendSuccess(res, {
    message: "Shipping record updated.",
    data,
  });
});

const remove = asyncHandler(async (req, res) => {
  const data = await shippingService.remove(req.params.id);
  return sendSuccess(res, {
    message: "Shipping record deleted.",
    data,
  });
});

module.exports = { list, getById, create, update, remove };
