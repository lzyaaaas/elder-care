const { z } = require("zod");

const paymentMethodEnum = z.enum(["CASH", "CARD", "BANK_TRANSFER", "CHECK", "OTHER"]);

const paymentCreateSchema = z.object({
  payableId: z.coerce.number().int().positive(),
  amount: z.coerce.number().nonnegative(),
  paymentDate: z.coerce.date(),
  paymentMethod: paymentMethodEnum,
  referenceNumber: z.string().max(80).optional().nullable(),
  notes: z.string().max(255).optional().nullable(),
});

const paymentUpdateSchema = paymentCreateSchema.partial();

module.exports = {
  paymentCreateSchema,
  paymentUpdateSchema,
};
