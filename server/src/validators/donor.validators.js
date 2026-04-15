const { z } = require("zod");

const donorCreateSchema = z.object({
  donorCode: z.string().max(30).optional(),
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  birthday: z.coerce.date().optional().nullable(),
  gender: z.enum(["FEMALE", "MALE", "NON_BINARY", "PREFER_NOT_TO_SAY"]).optional().nullable(),
  maritalStatus: z.enum(["SINGLE", "MARRIED", "PREFER_NOT_TO_SAY"]).optional().nullable(),
  country: z.string().min(1).max(80),
  state: z.string().max(80).optional().nullable(),
  city: z.string().max(80).optional().nullable(),
  streetAddress: z.string().max(255).optional().nullable(),
  postalCode: z.string().max(20).optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().max(30).optional().nullable(),
  preferredLanguage: z.string().max(30).optional().nullable(),
  accountStatus: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  supporterType: z.enum(["SUPPORTER", "DONOR"]).optional(),
  sourceEventId: z.coerce.number().int().positive().optional().nullable(),
  registrationDate: z.coerce.date().optional(),
});

const donorUpdateSchema = donorCreateSchema.partial();

module.exports = { donorCreateSchema, donorUpdateSchema };
