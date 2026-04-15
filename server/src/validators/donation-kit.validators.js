const { z } = require("zod");

const donationKitCreateSchema = z.object({
  kitCode: z.string().max(30).optional(),
  kitName: z.string().min(1).max(120),
  description: z.string().max(255).optional().nullable(),
  isActive: z.boolean().optional(),
});

const donationKitUpdateSchema = donationKitCreateSchema.partial();

module.exports = {
  donationKitCreateSchema,
  donationKitUpdateSchema,
};
