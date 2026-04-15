const { z } = require("zod");

const paymentMethodEnum = z.enum(["CASH", "CARD", "BANK_TRANSFER", "CHECK", "OTHER"]);
const receiptStatusEnum = z.enum(["ISSUED", "VOID"]);

const receiptCreateSchema = z.object({
  receiptNumber: z.string().max(30).optional(),
  donationId: z.coerce.number().int().positive(),
  amount: z.coerce.number().nonnegative(),
  receiptDate: z.coerce.date(),
  paymentMethod: paymentMethodEnum,
  transactionId: z.string().max(80).optional().nullable(),
  status: receiptStatusEnum.optional(),
  notes: z.string().max(255).optional().nullable(),
});

const receiptUpdateSchema = receiptCreateSchema.partial();

module.exports = {
  receiptCreateSchema,
  receiptUpdateSchema,
};
