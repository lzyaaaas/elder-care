const { z } = require("zod");

const donorRegisterSchema = z.object({
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  birthday: z.coerce.date().optional().nullable(),
  gender: z.enum(["FEMALE", "MALE", "NON_BINARY", "PREFER_NOT_TO_SAY"]).optional().nullable(),
  maritalStatus: z.enum(["SINGLE", "MARRIED", "PREFER_NOT_TO_SAY"]).optional().nullable(),
  phone: z.string().max(30).optional().nullable(),
  country: z.string().min(1).max(80),
  state: z.string().max(80).optional().nullable(),
  city: z.string().max(80).optional().nullable(),
  preferredLanguage: z.string().max(30).optional().nullable(),
  sourceEventId: z.coerce.number().int().positive().optional().nullable(),
});

const donorLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(100),
});

const donorProfileUpdateSchema = z.object({
  firstName: z.string().min(1).max(80).optional(),
  lastName: z.string().min(1).max(80).optional(),
  birthday: z.coerce.date().optional().nullable(),
  gender: z.enum(["FEMALE", "MALE", "NON_BINARY", "PREFER_NOT_TO_SAY"]).optional().nullable(),
  maritalStatus: z.enum(["SINGLE", "MARRIED", "PREFER_NOT_TO_SAY"]).optional().nullable(),
  phone: z.string().max(30).optional().nullable(),
  country: z.string().min(1).max(80).optional(),
  state: z.string().max(80).optional().nullable(),
  city: z.string().max(80).optional().nullable(),
  preferredLanguage: z.string().max(30).optional().nullable(),
});

const donorPortalFeedbackSchema = z.object({
  donationId: z.coerce.number().int().positive(),
  feedbackContent: z.string().min(1).max(1000),
  rating: z.coerce.number().int().min(1).max(5).optional().nullable(),
  feedbackDate: z.coerce.date().optional(),
});

module.exports = {
  donorRegisterSchema,
  donorLoginSchema,
  donorProfileUpdateSchema,
  donorPortalFeedbackSchema,
};
