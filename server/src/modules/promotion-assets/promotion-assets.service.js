const { prisma } = require("../../config/prisma");
const { generateCode } = require("../../utils/code");
const { buildPagination } = require("../../utils/pagination");

async function list(query) {
  const { page, pageSize, skip, take } = buildPagination(query);
  const search = query.search?.trim();
  const where = search
    ? {
        OR: [
          { assetCode: { contains: search } },
          { assetName: { contains: search } },
          { description: { contains: search } },
        ],
      }
    : {};
  const [items, total] = await Promise.all([
    prisma.promotionAsset.findMany({ where, skip, take, orderBy: { createdAt: "desc" } }),
    prisma.promotionAsset.count({ where }),
  ]);
  return { items, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
}

async function getById(id) {
  return prisma.promotionAsset.findUniqueOrThrow({ where: { id }, include: { eventPromotions: true } });
}

async function create(input) {
  return prisma.promotionAsset.create({ data: { ...input, assetCode: input.assetCode || generateCode("AST") } });
}

async function update(id, input) {
  return prisma.promotionAsset.update({ where: { id }, data: input });
}

async function remove(id) {
  await prisma.promotionAsset.delete({ where: { id } });
  return { id };
}

module.exports = { list, getById, create, update, remove };
