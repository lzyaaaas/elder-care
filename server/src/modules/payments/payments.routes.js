const express = require("express");

const { authenticate } = require("../../middleware/authenticate");
const { validate } = require("../../middleware/validate");
const { idParamSchema, listQuerySchema } = require("../../validators/common.validators");
const { paymentCreateSchema, paymentUpdateSchema } = require("../../validators/payment.validators");
const controller = require("./payments.controller");

const router = express.Router();
router.use(authenticate);
router.get("/", validate({ query: listQuerySchema }), controller.list);
router.get("/:id", validate({ params: idParamSchema }), controller.getById);
router.post("/", validate({ body: paymentCreateSchema }), controller.create);
router.patch("/:id", validate({ params: idParamSchema, body: paymentUpdateSchema }), controller.update);
router.delete("/:id", validate({ params: idParamSchema }), controller.remove);

module.exports = router;
