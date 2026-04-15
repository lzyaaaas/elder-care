const express = require("express");

const { authenticate } = require("../../middleware/authenticate");
const { validate } = require("../../middleware/validate");
const { idParamSchema, listQuerySchema } = require("../../validators/common.validators");
const {
  donationReceivableCreateSchema,
  donationReceivableUpdateSchema,
} = require("../../validators/donation-receivable.validators");
const donationReceivableController = require("./donation-receivables.controller");

const router = express.Router();

router.use(authenticate);

router.get("/", validate({ query: listQuerySchema }), donationReceivableController.list);
router.get("/:id", validate({ params: idParamSchema }), donationReceivableController.getById);
router.post("/", validate({ body: donationReceivableCreateSchema }), donationReceivableController.create);
router.patch(
  "/:id",
  validate({ params: idParamSchema, body: donationReceivableUpdateSchema }),
  donationReceivableController.update,
);
router.delete("/:id", validate({ params: idParamSchema }), donationReceivableController.remove);

module.exports = router;
