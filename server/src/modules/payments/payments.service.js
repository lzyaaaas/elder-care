const { prisma } = require("../../config/prisma");
const { buildPagination } = require("../../utils/pagination");

async function list(query) {
  const { page, pageSize, skip, take } = buildPagination(query);
  const search = query.search?.trim();
  const where = search
    ? {
        OR: [
          { referenceNumber: { contains: search } },
          { payable: { invoice: { invoiceNumber: { contains: search } } } },
        ],
      }
    : {};
  const [items, total] = await Promise.all([
    prisma.invoicePayment.findMany({
      where,
      skip,
      take,
      orderBy: { paymentDate: "desc" },
      include: { payable: { include: { invoice: { include: { vendor: true } } } } },
    }),
    prisma.invoicePayment.count({ where }),
  ]);
  return { items, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
}

async function getById(id) {
  return prisma.invoicePayment.findUniqueOrThrow({ where: { id }, include: { payable: { include: { invoice: { include: { vendor: true } } } } } });
}

async function create(input) {
  return prisma.invoicePayment.create({ data: input, include: { payable: { include: { invoice: { include: { vendor: true } } } } } });
}

async function update(id, input) {
  return prisma.invoicePayment.update({ where: { id }, data: input, include: { payable: { include: { invoice: { include: { vendor: true } } } } } });
}

async function remove(id) {
  await prisma.invoicePayment.delete({ where: { id } });
  return { id };
}

module.exports = { list, getById, create, update, remove };
