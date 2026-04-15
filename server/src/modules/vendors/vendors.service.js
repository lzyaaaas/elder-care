const { prisma } = require("../../config/prisma");
const { generateCode } = require("../../utils/code");
const { buildPagination } = require("../../utils/pagination");

async function list(query) {
  const { page, pageSize, skip, take } = buildPagination(query);
  const search = query.search?.trim();
  const where = search
    ? {
        OR: [
          { vendorCode: { contains: search } },
          { name: { contains: search } },
          { contactPerson: { contains: search } },
          { email: { contains: search } },
          { supplyType: { contains: search } },
        ],
      }
    : {};
  const [items, total] = await Promise.all([
    prisma.vendor.findMany({ where, skip, take, orderBy: { createdAt: "desc" } }),
    prisma.vendor.count({ where }),
  ]);
  return { items, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
}

async function getById(id) {
  return prisma.vendor.findUniqueOrThrow({ where: { id }, include: { invoices: true } });
}

async function create(input) {
  return prisma.vendor.create({ data: { ...input, vendorCode: input.vendorCode || generateCode("VEN") } });
}

async function update(id, input) {
  return prisma.vendor.update({ where: { id }, data: input });
}

async function remove(id) {
  await prisma.vendor.delete({ where: { id } });
  return { id };
}

module.exports = { list, getById, create, update, remove };
