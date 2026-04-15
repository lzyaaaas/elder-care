const express = require("express");

const { authenticate } = require("../../middleware/authenticate");
const { validate } = require("../../middleware/validate");
const { idParamSchema, listQuerySchema } = require("../../validators/common.validators");
const { feedbackCreateSchema, feedbackUpdateSchema } = require("../../validators/feedback.validators");
const feedbackController = require("./feedback.controller");

const router = express.Router();

router.use(authenticate);

router.get("/", validate({ query: listQuerySchema }), feedbackController.list);
router.get("/:id", validate({ params: idParamSchema }), feedbackController.getById);
router.post("/", validate({ body: feedbackCreateSchema }), feedbackController.create);
router.patch("/:id", validate({ params: idParamSchema, body: feedbackUpdateSchema }), feedbackController.update);
router.delete("/:id", validate({ params: idParamSchema }), feedbackController.remove);

module.exports = router;
