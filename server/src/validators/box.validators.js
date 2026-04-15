const { z } = require("zod");

const boxCreateSchema = z.object({
  boxCode: z.string().max(30).optional(),
  size: z.string().min(1).max(50),
  unitCost: z.coerce.number().nonnegative(),
  currentStock: z.coerce.number().int().nonnegative().optional(),
  reorderLevel: z.coerce.number().int().nonnegative().optional(),
  description: z.string().max(255).optional().nullable(),
  lastRestockDate: z.coerce.date().optional().nullable(),
  isActive: z.boolean().optional(),
});

const boxUpdateSchema = boxCreateSchema.partial();

module.exports = {
  boxCreateSchema,
  boxUpdateSchema,
};
