const express = require("express");

const { authenticate } = require("../../middleware/authenticate");
const { validate } = require("../../middleware/validate");
const { loginSchema } = require("../../validators/auth.validators");
const authController = require("./auth.controller");

const router = express.Router();

router.post("/login", validate({ body: loginSchema }), authController.login);
router.get("/me", authenticate, authController.getMe);

module.exports = router;
