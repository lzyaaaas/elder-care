const express = require("express");

const { authenticate } = require("../../middleware/authenticate");
const { validate } = require("../../middleware/validate");
const { idParamSchema, listQuerySchema } = require("../../validators/common.validators");
const { donorCreateSchema, donorUpdateSchema } = require("../../validators/donor.validators");
const donorController = require("./donors.controller");

const router = express.Router();

router.use(authenticate);

router.get("/", validate({ query: listQuerySchema }), donorController.list);
router.get("/:id", validate({ params: idParamSchema }), donorController.getById);
router.post("/", validate({ body: donorCreateSchema }), donorController.create);
router.patch(
  "/:id",
  validate({ params: idParamSchema, body: donorUpdateSchema }),
  donorController.update,
);
router.delete("/:id", validate({ params: idParamSchema }), donorController.remove);

module.exports = router;
