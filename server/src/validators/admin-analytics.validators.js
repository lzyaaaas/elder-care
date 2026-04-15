const { z } = require("zod");

const adminAnalyticsModuleKeys = [
  "employees",
  "schedules",
  "donors",
  "donations",
  "receipts",
  "shipping",
  "feedback",
  "donation-kits",
  "books",
  "envelopes",
  "boxes",
  "promotion-inventory",
  "events",
  "promotion-assets",
  "vendors",
  "invoices",
  "payables",
  "payments",
];

const adminAnalyticsParamsSchema = z.object({
  moduleKey: z.enum(adminAnalyticsModuleKeys),
});

const analyticsFilterSchema = z.object({
  attribute: z.string().min(1),
  operator: z.enum(["equals", "in", "contains", "gt", "lt", "gte", "eq", "between", "before", "after"]),
  value: z.union([z.string(), z.number(), z.boolean()]).optional(),
  valueTo: z.union([z.string(), z.number()]).optional(),
});

const adminAnalyticsQuerySchema = z.object({
  filters: z.array(analyticsFilterSchema).default([]),
});

module.exports = {
  adminAnalyticsModuleKeys,
  adminAnalyticsParamsSchema,
  adminAnalyticsQuerySchema,
};
