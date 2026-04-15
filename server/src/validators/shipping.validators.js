const { z } = require("zod");

const shippingStatusEnum = z.enum(["PENDING", "PREPARING", "SHIPPED", "DELIVERED", "RETURNED", "LOST"]);

const shippingCreateSchema = z.object({
  donationId: z.coerce.number().int().positive(),
  trackingNumber: z.string().max(80).optional().nullable(),
  carrier: z.string().max(80).optional().nullable(),
  shippedDate: z.coerce.date().optional().nullable(),
  deliveryDate: z.coerce.date().optional().nullable(),
  shippingCost: z.coerce.number().nonnegative().optional().nullable(),
  status: shippingStatusEnum.optional(),
});

const shippingUpdateSchema = shippingCreateSchema.partial();

module.exports = {
  shippingCreateSchema,
  shippingUpdateSchema,
};
