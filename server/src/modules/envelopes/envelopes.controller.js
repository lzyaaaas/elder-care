const { sendSuccess } = require("../../utils/api-response");
const { asyncHandler } = require("../../utils/async-handler");
const service = require("./envelopes.service");

const list = asyncHandler(async (req, res) => sendSuccess(res, { message: "Envelopes loaded.", data: await service.list(req.query) }));
const getById = asyncHandler(async (req, res) => sendSuccess(res, { message: "Envelope loaded.", data: await service.getById(req.params.id) }));
const create = asyncHandler(async (req, res) => sendSuccess(res, { statusCode: 201, message: "Envelope created.", data: await service.create(req.body) }));
const update = asyncHandler(async (req, res) => sendSuccess(res, { message: "Envelope updated.", data: await service.update(req.params.id, req.body) }));
const remove = asyncHandler(async (req, res) => sendSuccess(res, { message: "Envelope deleted.", data: await service.remove(req.params.id) }));

module.exports = { list, getById, create, update, remove };
