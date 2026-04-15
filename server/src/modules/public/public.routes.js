const express = require("express");

const { validate } = require("../../middleware/validate");
const { publicDonationSchema, publicFeedbackSchema } = require("../../validators/public.validators");
const publicController = require("./public.controller");

const router = express.Router();

router.get("/events", publicController.listEvents);
router.post("/donations", validate({ body: publicDonationSchema }), publicController.createDonation);
router.post("/feedback", validate({ body: publicFeedbackSchema }), publicController.createFeedback);

module.exports = router;
