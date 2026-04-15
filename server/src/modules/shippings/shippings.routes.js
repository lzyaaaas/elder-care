const express = require("express");

const { authenticate } = require("../../middleware/authenticate");
const { validate } = require("../../middleware/validate");
const { idParamSchema, listQuerySchema } = require("../../validators/common.validators");
const { shippingCreateSchema, shippingUpdateSchema } = require("../../validators/shipping.validators");
const shippingController = require("./shippings.controller");

const router = express.Router();

router.use(authenticate);

router.get("/", validate({ query: listQuerySchema }), shippingController.list);
router.get("/:id", validate({ params: idParamSchema }), shippingController.getById);
router.post("/", validate({ body: shippingCreateSchema }), shippingController.create);
router.patch("/:id", validate({ params: idParamSchema, body: shippingUpdateSchema }), shippingController.update);
router.delete("/:id", validate({ params: idParamSchema }), shippingController.remove);

module.exports = router;
