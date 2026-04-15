const { z } = require("zod");

const vendorCreateSchema = z.object({
  vendorCode: z.string().max(30).optional(),
  name: z.string().min(1).max(160),
  contactPerson: z.string().max(120).optional().nullable(),
  phoneNumber: z.string().max(30).optional().nullable(),
  address: z.string().max(255).optional().nullable(),
  email: z.string().email().optional().nullable(),
  rating: z.coerce.number().int().min(1).max(5).optional().nullable(),
  supplyType: z.string().max(100).optional().nullable(),
  lastSupplyDate: z.coerce.date().optional().nullable(),
  isActive: z.boolean().optional(),
});

const vendorUpdateSchema = vendorCreateSchema.partial();

module.exports = {
  vendorCreateSchema,
  vendorUpdateSchema,
};
