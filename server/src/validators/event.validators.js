const { z } = require("zod");

const eventTypeEnum = z.enum([
  "FUNDRAISER",
  "SCHOOL_VISIT",
  "COMMUNITY_OUTREACH",
  "ONLINE_CAMPAIGN",
  "BOOK_LAUNCH",
  "OTHER",
]);

const eventCreateSchema = z.object({
  eventName: z.string().min(1).max(160),
  description: z.string().max(500).optional().nullable(),
  type: eventTypeEnum.optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional().nullable(),
  country: z.string().min(1).max(80),
  state: z.string().max(80).optional().nullable(),
  city: z.string().max(80).optional().nullable(),
  employeeId: z.coerce.number().int().positive().optional().nullable(),
  isActive: z.boolean().optional(),
});

const eventUpdateSchema = eventCreateSchema.partial();

module.exports = {
  eventCreateSchema,
  eventUpdateSchema,
};
