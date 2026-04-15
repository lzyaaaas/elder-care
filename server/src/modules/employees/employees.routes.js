const express = require("express");

const { authenticate } = require("../../middleware/authenticate");
const { validate } = require("../../middleware/validate");
const { idParamSchema, listQuerySchema } = require("../../validators/common.validators");
const { employeeCreateSchema, employeeUpdateSchema } = require("../../validators/employee.validators");
const employeeController = require("./employees.controller");

const router = express.Router();

router.use(authenticate);

router.get("/", validate({ query: listQuerySchema }), employeeController.list);
router.get("/:id", validate({ params: idParamSchema }), employeeController.getById);
router.post("/", validate({ body: employeeCreateSchema }), employeeController.create);
router.patch("/:id", validate({ params: idParamSchema, body: employeeUpdateSchema }), employeeController.update);
router.delete("/:id", validate({ params: idParamSchema }), employeeController.remove);

module.exports = router;
