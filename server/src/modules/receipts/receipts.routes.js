const express = require("express");

const { authenticate } = require("../../middleware/authenticate");
const { validate } = require("../../middleware/validate");
const { idParamSchema, listQuerySchema } = require("../../validators/common.validators");
const { receiptCreateSchema, receiptUpdateSchema } = require("../../validators/receipt.validators");
const receiptController = require("./receipts.controller");

const router = express.Router();

router.use(authenticate);

router.get("/", validate({ query: listQuerySchema }), receiptController.list);
router.get("/:id", validate({ params: idParamSchema }), receiptController.getById);
router.post("/", validate({ body: receiptCreateSchema }), receiptController.create);
router.patch("/:id", validate({ params: idParamSchema, body: receiptUpdateSchema }), receiptController.update);
router.delete("/:id", validate({ params: idParamSchema }), receiptController.remove);

module.exports = router;
