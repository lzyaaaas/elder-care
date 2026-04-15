const { z } = require("zod");

const assetCategoryEnum = z.enum(["PRINT", "DIGITAL", "MERCHANDISE", "DISPLAY", "OTHER"]);
const assetTypeEnum = z.enum(["FLYER", "POSTER", "BANNER", "BOOKMARK", "STICKER", "GIFT", "OTHER"]);

const promotionAssetCreateSchema = z.object({
  assetCode: z.string().max(30).optional(),
  assetCategory: assetCategoryEnum.optional(),
  assetName: z.string().min(1).max(160),
  description: z.string().max(255).optional().nullable(),
  assetType: assetTypeEnum.optional(),
  isActive: z.boolean().optional(),
});

const promotionAssetUpdateSchema = promotionAssetCreateSchema.partial();

module.exports = {
  promotionAssetCreateSchema,
  promotionAssetUpdateSchema,
};
