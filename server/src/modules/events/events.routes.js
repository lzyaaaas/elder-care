const express = require("express");

const { authenticate } = require("../../middleware/authenticate");
const { validate } = require("../../middleware/validate");
const { idParamSchema, listQuerySchema } = require("../../validators/common.validators");
const { eventCreateSchema, eventUpdateSchema } = require("../../validators/event.validators");
const controller = require("./events.controller");

const router = express.Router();
router.use(authenticate);
router.get("/", validate({ query: listQuerySchema }), controller.list);
router.get("/:id", validate({ params: idParamSchema }), controller.getById);
router.post("/", validate({ body: eventCreateSchema }), controller.create);
router.patch("/:id", validate({ params: idParamSchema, body: eventUpdateSchema }), controller.update);
router.delete("/:id", validate({ params: idParamSchema }), controller.remove);

module.exports = router;
