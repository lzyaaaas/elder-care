const { prisma } = require("../../config/prisma");
const { generateCode } = require("../../utils/code");
const { buildPagination } = require("../../utils/pagination");

async function list(query) {
  const { page, pageSize, skip, take } = buildPagination(query);
  const search = query.search?.trim();
  const where = search ? { OR: [{ envelopeCode: { contains: search } }, { size: { contains: search } }, { description: { contains: search } }] } : {};
  const [items, total] = await Promise.all([
    prisma.envelope.findMany({ where, skip, take, orderBy: { createdAt: "desc" } }),
    prisma.envelope.count({ where }),
  ]);
  return { items, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
}

async function getById(id) {
  return prisma.envelope.findUniqueOrThrow({ where: { id }, include: { kitComponents: true, invoiceItems: true } });
}

async function create(input) {
  return prisma.envelope.create({ data: { ...input, envelopeCode: input.envelopeCode || generateCode("ENV") } });
}

async function update(id, input) {
  return prisma.envelope.update({ where: { id }, data: input });
}

async function remove(id) {
  await prisma.envelope.delete({ where: { id } });
  return { id };
}

module.exports = { list, getById, create, update, remove };
