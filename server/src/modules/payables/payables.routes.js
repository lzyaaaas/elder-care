const express = require("express");

const { authenticate } = require("../../middleware/authenticate");
const { validate } = require("../../middleware/validate");
const { idParamSchema, listQuerySchema } = require("../../validators/common.validators");
const { payableCreateSchema, payableUpdateSchema } = require("../../validators/payable.validators");
const controller = require("./payables.controller");

const router = express.Router();
router.use(authenticate);
router.get("/", validate({ query: listQuerySchema }), controller.list);
router.get("/:id", validate({ params: idParamSchema }), controller.getById);
router.post("/", validate({ body: payableCreateSchema }), controller.create);
router.patch("/:id", validate({ params: idParamSchema, body: payableUpdateSchema }), controller.update);
router.delete("/:id", validate({ params: idParamSchema }), controller.remove);

module.exports = router;
