const express = require("express");

const { authenticateDonor } = require("../../middleware/authenticate");
const { validate } = require("../../middleware/validate");
const { donorPortalFeedbackSchema, donorProfileUpdateSchema } = require("../../validators/donor-auth.validators");
const donorPortalController = require("./donor-portal.controller");

const router = express.Router();

router.use(authenticateDonor);

router.get("/profile", donorPortalController.getProfile);
router.patch("/profile", validate({ body: donorProfileUpdateSchema }), donorPortalController.updateProfile);
router.get("/donations", donorPortalController.listDonations);
router.get("/receipts", donorPortalController.listReceipts);
router.get("/shipping", donorPortalController.listShipping);
router.get("/feedback", donorPortalController.listFeedback);
router.post("/feedback", validate({ body: donorPortalFeedbackSchema }), donorPortalController.createFeedback);

module.exports = router;
