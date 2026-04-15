const express = require("express");

const { authenticate } = require("../../middleware/authenticate");
const { validate } = require("../../middleware/validate");
const { idParamSchema, listQuerySchema } = require("../../validators/common.validators");
const { scheduleCreateSchema, scheduleUpdateSchema } = require("../../validators/schedule.validators");
const scheduleController = require("./schedules.controller");

const router = express.Router();

router.use(authenticate);

router.get("/", validate({ query: listQuerySchema }), scheduleController.list);
router.get("/:id", validate({ params: idParamSchema }), scheduleController.getById);
router.post("/", validate({ body: scheduleCreateSchema }), scheduleController.create);
router.patch("/:id", validate({ params: idParamSchema, body: scheduleUpdateSchema }), scheduleController.update);
router.delete("/:id", validate({ params: idParamSchema }), scheduleController.remove);

module.exports = router;
