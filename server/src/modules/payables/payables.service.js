const { prisma } = require("../../config/prisma");
const { buildPagination } = require("../../utils/pagination");

async function list(query) {
  const { page, pageSize, skip, take } = buildPagination(query);
  const search = query.search?.trim();
  const where = search
    ? {
        OR: [
          { invoice: { invoiceNumber: { contains: search } } },
          { paymentTerms: { contains: search } },
          { notes: { contains: search } },
        ],
      }
    : {};
  const [items, total] = await Promise.all([
    prisma.payable.findMany({
      where,
      skip,
      take,
      orderBy: { dueDate: "asc" },
      include: { invoice: { include: { vendor: true } }, payments: true },
    }),
    prisma.payable.count({ where }),
  ]);
  return { items, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
}

async function getById(id) {
  return prisma.payable.findUniqueOrThrow({
    where: { id },
    include: { invoice: { include: { vendor: true } }, payments: true },
  });
}

async function create(input) {
  return prisma.payable.create({ data: input, include: { invoice: { include: { vendor: true } }, payments: true } });
}

async function update(id, input) {
  return prisma.payable.update({ where: { id }, data: input, include: { invoice: { include: { vendor: true } }, payments: true } });
}

async function remove(id) {
  await prisma.payable.delete({ where: { id } });
  return { id };
}

module.exports = { list, getById, create, update, remove };
