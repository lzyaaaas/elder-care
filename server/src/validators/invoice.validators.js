const { z } = require("zod");

const invoiceStatusEnum = z.enum([
  "DRAFT",
  "PENDING_APPROVAL",
  "APPROVED",
  "PARTIALLY_PAID",
  "PAID",
  "OVERDUE",
  "CANCELLED",
]);

const invoiceCreateSchema = z.object({
  invoiceNumber: z.string().max(30).optional(),
  employeeId: z.coerce.number().int().positive().optional().nullable(),
  invoiceDate: z.coerce.date(),
  dueDate: z.coerce.date(),
  vendorId: z.coerce.number().int().positive(),
  status: invoiceStatusEnum.optional(),
  notes: z.string().max(500).optional().nullable(),
  subtotal: z.coerce.number().nonnegative().optional(),
  taxAmount: z.coerce.number().nonnegative().optional(),
  totalAmount: z.coerce.number().nonnegative().optional(),
});

const invoiceUpdateSchema = invoiceCreateSchema.partial();

module.exports = {
  invoiceCreateSchema,
  invoiceUpdateSchema,
};
