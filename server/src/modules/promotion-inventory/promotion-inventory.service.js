const { prisma } = require("../../config/prisma");
const { generateCode } = require("../../utils/code");
const { buildPagination } = require("../../utils/pagination");

async function list(query) {
  const { page, pageSize, skip, take } = buildPagination(query);
  const search = query.search?.trim();
  const where = search
    ? {
        OR: [
          { inventoryCode: { contains: search } },
          { promotionInventoryType: { contains: search } },
          { size: { contains: search } },
          { description: { contains: search } },
        ],
      }
    : {};
  const [items, total] = await Promise.all([
    prisma.promotionInventory.findMany({ where, skip, take, orderBy: { createdAt: "desc" } }),
    prisma.promotionInventory.count({ where }),
  ]);
  return { items, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
}

async function getById(id) {
  return prisma.promotionInventory.findUniqueOrThrow({ where: { id }, include: { assignments: true, invoiceItems: true } });
}

async function create(input) {
  return prisma.promotionInventory.create({ data: { ...input, inventoryCode: input.inventoryCode || generateCode("PINV") } });
}

async function update(id, input) {
  return prisma.promotionInventory.update({ where: { id }, data: input });
}

async function remove(id) {
  await prisma.promotionInventory.delete({ where: { id } });
  return { id };
}

module.exports = { list, getById, create, update, remove };
