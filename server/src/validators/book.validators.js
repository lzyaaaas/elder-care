const { z } = require("zod");

const bookCreateSchema = z.object({
  pressId: z.coerce.number().int().positive(),
  bookSeriesId: z.coerce.number().int().positive().optional().nullable(),
  title: z.string().min(1).max(180),
  bookFormatId: z.coerce.number().int().positive(),
  description: z.string().max(500).optional().nullable(),
  pageCount: z.coerce.number().int().nonnegative().optional().nullable(),
  unitCost: z.coerce.number().nonnegative(),
  currentStock: z.coerce.number().int().nonnegative().optional(),
  reorderLevel: z.coerce.number().int().nonnegative().optional(),
  publicationDate: z.coerce.date().optional().nullable(),
});

const bookUpdateSchema = bookCreateSchema.partial();

module.exports = {
  bookCreateSchema,
  bookUpdateSchema,
};
