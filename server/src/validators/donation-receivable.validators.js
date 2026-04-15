const { z } = require("zod");

const donationReceivableCreateSchema = z.object({
  donationCode: z.string().max(30).optional(),
  donorId: z.coerce.number().int().positive(),
  eventId: z.coerce.number().int().positive().optional().nullable(),
  donationAmount: z.coerce.number().nonnegative(),
  donationDate: z.coerce.date(),
  donationFrequency: z.enum(["ONE_TIME", "MONTHLY"]).optional(),
  status: z
    .enum(["PENDING", "CONFIRMED", "RECEIPTED", "SHIPPED", "COMPLETED", "CANCELLED"])
    .optional(),
  donationKitId: z.coerce.number().int().positive().optional().nullable(),
  employeeId: z.coerce.number().int().positive().optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

const donationReceivableUpdateSchema = donationReceivableCreateSchema.partial();

module.exports = {
  donationReceivableCreateSchema,
  donationReceivableUpdateSchema,
};
