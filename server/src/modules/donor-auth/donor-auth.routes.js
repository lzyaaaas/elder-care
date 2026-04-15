const express = require("express");

const { authenticateDonor } = require("../../middleware/authenticate");
const { validate } = require("../../middleware/validate");
const { donorLoginSchema, donorRegisterSchema } = require("../../validators/donor-auth.validators");
const donorAuthController = require("./donor-auth.controller");

const router = express.Router();

router.post("/register", validate({ body: donorRegisterSchema }), donorAuthController.register);
router.post("/login", validate({ body: donorLoginSchema }), donorAuthController.login);
router.get("/me", authenticateDonor, donorAuthController.getMe);

module.exports = router;
