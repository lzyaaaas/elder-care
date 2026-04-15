const { z } = require("zod");

const promotionInventoryCreateSchema = z.object({
  inventoryCode: z.string().max(30).optional(),
  promotionInventoryType: z.string().min(1).max(80),
  size: z.string().max(50).optional().nullable(),
  unitCost: z.coerce.number().nonnegative(),
  currentStock: z.coerce.number().int().nonnegative().optional(),
  reorderLevel: z.coerce.number().int().nonnegative().optional(),
  description: z.string().max(255).optional().nullable(),
  lastRestockDate: z.coerce.date().optional().nullable(),
  isActive: z.boolean().optional(),
});

const promotionInventoryUpdateSchema = promotionInventoryCreateSchema.partial();

module.exports = {
  promotionInventoryCreateSchema,
  promotionInventoryUpdateSchema,
};
