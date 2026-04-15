const { z } = require("zod");

const scheduleCreateSchema = z.object({
  employeeId: z.coerce.number().int().positive(),
  eventId: z.coerce.number().int().positive().optional().nullable(),
  shiftDate: z.coerce.date(),
  startTime: z.string().min(1).max(10),
  endTime: z.string().min(1).max(10),
  status: z.enum(["SCHEDULED", "COMPLETED", "CANCELLED"]).optional(),
  notes: z.string().max(255).optional().nullable(),
});

const scheduleUpdateSchema = scheduleCreateSchema.partial();

const employeeProfileUpdateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  email: z.string().email().optional().nullable(),
  contact: z.string().max(120).optional().nullable(),
  maritalStatus: z.enum(["SINGLE", "MARRIED", "PREFER_NOT_TO_SAY"]).optional().nullable(),
});

const employeePasswordUpdateSchema = z.object({
  currentPassword: z.string().min(1).max(100),
  newPassword: z.string().min(6).max(100),
});

module.exports = {
  scheduleCreateSchema,
  scheduleUpdateSchema,
  employeeProfileUpdateSchema,
  employeePasswordUpdateSchema,
};
