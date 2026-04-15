const { z } = require("zod");

const employeeCreateSchema = z.object({
  employeeCode: z.string().max(30).optional(),
  name: z.string().min(1).max(120),
  gender: z.enum(["FEMALE", "MALE", "NON_BINARY", "PREFER_NOT_TO_SAY"]).optional().nullable(),
  maritalStatus: z.enum(["SINGLE", "MARRIED", "PREFER_NOT_TO_SAY"]).optional().nullable(),
  birthday: z.coerce.date().optional().nullable(),
  contact: z.string().max(120).optional().nullable(),
  schedule: z.string().max(120).optional().nullable(),
  hometown: z.string().max(120).optional().nullable(),
  position: z.string().max(100).optional().nullable(),
  email: z.string().email().optional().nullable(),
  password: z.string().min(6).max(100).optional().nullable(),
  role: z.enum(["ADMIN", "OPERATIONS", "FINANCE", "EVENT", "VOLUNTEER"]).optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

const employeeUpdateSchema = employeeCreateSchema.partial();

module.exports = {
  employeeCreateSchema,
  employeeUpdateSchema,
};
