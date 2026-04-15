const express = require("express");

const { authenticate } = require("../../middleware/authenticate");
const { validate } = require("../../middleware/validate");
const { idParamSchema, listQuerySchema } = require("../../validators/common.validators");
const { promotionInventoryCreateSchema, promotionInventoryUpdateSchema } = require("../../validators/promotion-inventory.validators");
const controller = require("./promotion-inventory.controller");

const router = express.Router();
router.use(authenticate);
router.get("/", validate({ query: listQuerySchema }), controller.list);
router.get("/:id", validate({ params: idParamSchema }), controller.getById);
router.post("/", validate({ body: promotionInventoryCreateSchema }), controller.create);
router.patch("/:id", validate({ params: idParamSchema, body: promotionInventoryUpdateSchema }), controller.update);
router.delete("/:id", validate({ params: idParamSchema }), controller.remove);

module.exports = router;
