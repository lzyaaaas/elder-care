const { sendSuccess } = require("../../utils/api-response");
const { asyncHandler } = require("../../utils/async-handler");
const service = require("./invoices.service");

const list = asyncHandler(async (req, res) => sendSuccess(res, { message: "Invoices loaded.", data: await service.list(req.query) }));
const getById = asyncHandler(async (req, res) => sendSuccess(res, { message: "Invoice loaded.", data: await service.getById(req.params.id) }));
const create = asyncHandler(async (req, res) => sendSuccess(res, { statusCode: 201, message: "Invoice created.", data: await service.create(req.body) }));
const update = asyncHandler(async (req, res) => sendSuccess(res, { message: "Invoice updated.", data: await service.update(req.params.id, req.body) }));
const remove = asyncHandler(async (req, res) => sendSuccess(res, { message: "Invoice deleted.", data: await service.remove(req.params.id) }));

module.exports = { list, getById, create, update, remove };
