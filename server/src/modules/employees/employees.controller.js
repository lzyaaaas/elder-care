const { sendSuccess } = require("../../utils/api-response");
const { asyncHandler } = require("../../utils/async-handler");
const employeeService = require("./employees.service");

const list = asyncHandler(async (req, res) => {
  const data = await employeeService.list(req.query);
  return sendSuccess(res, {
    message: "Employees loaded.",
    data,
  });
});

const getById = asyncHandler(async (req, res) => {
  const data = await employeeService.getById(req.params.id);
  return sendSuccess(res, {
    message: "Employee loaded.",
    data,
  });
});

const create = asyncHandler(async (req, res) => {
  const data = await employeeService.create(req.body);
  return sendSuccess(res, {
    statusCode: 201,
    message: "Employee created.",
    data,
  });
});

const update = asyncHandler(async (req, res) => {
  const data = await employeeService.update(req.params.id, req.body);
  return sendSuccess(res, {
    message: "Employee updated.",
    data,
  });
});

const remove = asyncHandler(async (req, res) => {
  const data = await employeeService.remove(req.params.id);
  return sendSuccess(res, {
    message: "Employee deleted.",
    data,
  });
});

module.exports = { list, getById, create, update, remove };
