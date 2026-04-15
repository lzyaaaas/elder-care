const { z } = require("zod");

const feedbackStatusEnum = z.enum(["NEW", "REVIEWED", "RESPONDED", "CLOSED"]);

const feedbackCreateSchema = z.object({
  donationId: z.coerce.number().int().positive(),
  feedbackContent: z.string().min(1).max(1000),
  rating: z.coerce.number().int().min(1).max(5).optional().nullable(),
  feedbackDate: z.coerce.date(),
  responseContent: z.string().max(1000).optional().nullable(),
  responseDate: z.coerce.date().optional().nullable(),
  status: feedbackStatusEnum.optional(),
});

const feedbackUpdateSchema = feedbackCreateSchema.partial();

module.exports = {
  feedbackCreateSchema,
  feedbackUpdateSchema,
};
