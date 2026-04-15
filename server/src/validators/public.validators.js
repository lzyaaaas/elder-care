const { z } = require("zod");

const publicDonationSchema = z.object({
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  birthday: z.coerce.date().optional().nullable(),
  gender: z.enum(["FEMALE", "MALE", "NON_BINARY", "PREFER_NOT_TO_SAY"]).optional().nullable(),
  maritalStatus: z.enum(["SINGLE", "MARRIED", "PREFER_NOT_TO_SAY"]).optional().nullable(),
  createAccount: z.coerce.boolean().optional(),
  password: z.string().min(6).max(100).optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().max(30).optional().nullable(),
  country: z.string().min(1).max(80),
  state: z.string().max(80).optional().nullable(),
  city: z.string().max(80).optional().nullable(),
  preferredLanguage: z.string().max(30).optional().nullable(),
  donationAmount: z.coerce.number().nonnegative(),
  donationFrequency: z.enum(["ONE_TIME", "MONTHLY"]).optional(),
  donationDate: z.coerce.date().optional(),
  eventId: z.coerce.number().int().positive().optional().nullable(),
  sourceEventId: z.coerce.number().int().positive().optional().nullable(),
  donationKitId: z.coerce.number().int().positive().optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

const publicFeedbackSchema = z.object({
  donationId: z.coerce.number().int().positive().optional(),
  donationCode: z.string().max(30).optional(),
  feedbackContent: z.string().min(1).max(1000),
  rating: z.coerce.number().int().min(1).max(5).optional().nullable(),
  feedbackDate: z.coerce.date().optional(),
});

module.exports = { publicDonationSchema, publicFeedbackSchema };
