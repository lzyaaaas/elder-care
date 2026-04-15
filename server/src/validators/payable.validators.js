const { z } = require("zod");

const payableStatusEnum = z.enum(["OPEN", "PARTIALLY_PAID", "PAID", "OVERDUE", "CANCELLED"]);

const payableCreateSchema = z.object({
  invoiceId: z.coerce.number().int().positive(),
  remainingAmount: z.coerce.number().nonnegative(),
  dueDate: z.coerce.date(),
  paymentTerms: z.string().max(120).optional().nullable(),
  notes: z.string().max(255).optional().nullable(),
  status: payableStatusEnum.optional(),
});

const payableUpdateSchema = payableCreateSchema.partial();

module.exports = {
  payableCreateSchema,
  payableUpdateSchema,
};
