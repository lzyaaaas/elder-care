const express = require("express");

const { authenticateEmployee } = require("../../middleware/authenticate");
const { validate } = require("../../middleware/validate");
const { idParamSchema } = require("../../validators/common.validators");
const { employeePasswordUpdateSchema, employeeProfileUpdateSchema } = require("../../validators/schedule.validators");
const employeePortalController = require("./employee-portal.controller");

const router = express.Router();

router.use(authenticateEmployee);

router.get("/dashboard", employeePortalController.getDashboard);
router.get("/me", employeePortalController.getMe);
router.patch("/me", validate({ body: employeeProfileUpdateSchema }), employeePortalController.updateMe);
router.patch("/password", validate({ body: employeePasswordUpdateSchema }), employeePortalController.updatePassword);
router.get("/schedule", employeePortalController.listSchedule);
router.get("/schedule/:id", validate({ params: idParamSchema }), employeePortalController.getScheduleById);
router.get("/events", employeePortalController.listEvents);
router.get("/donations", employeePortalController.listDonations);
router.get("/shippings", employeePortalController.listShippingTasks);
router.get("/feedback", employeePortalController.listFollowUps);

module.exports = router;
