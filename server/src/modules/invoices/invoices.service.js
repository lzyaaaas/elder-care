const { prisma } = require("../../config/prisma");
const { generateCode } = require("../../utils/code");
const { buildPagination } = require("../../utils/pagination");

async function list(query) {
  const { page, pageSize, skip, take } = buildPagination(query);
  const search = query.search?.trim();
  const where = search
    ? {
        OR: [
          { invoiceNumber: { contains: search } },
          { vendor: { name: { contains: search } } },
          { employee: { name: { contains: search } } },
        ],
      }
    : {};
  const [items, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      skip,
      take,
      orderBy: { invoiceDate: "desc" },
      include: {
        vendor: true,
        employee: true,
        payable: true,
        items: {
          include: {
            envelope: true,
            box: true,
            promotionInventory: true,
          },
          orderBy: { id: "asc" },
        },
      },
    }),
    prisma.invoice.count({ where }),
  ]);
  return { items, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
}

async function getById(id) {
  return prisma.invoice.findUniqueOrThrow({
    where: { id },
    include: {
      vendor: true,
      employee: true,
      payable: true,
      items: {
        include: {
          envelope: true,
          box: true,
          promotionInventory: true,
        },
        orderBy: { id: "asc" },
      },
    },
  });
}

async function create(input) {
  return prisma.invoice.create({
    data: { ...input, invoiceNumber: input.invoiceNumber || generateCode("INV") },
    include: { vendor: true, employee: true, payable: true, items: true },
  });
}

async function update(id, input) {
  return prisma.invoice.update({
    where: { id },
    data: input,
    include: { vendor: true, employee: true, payable: true, items: true },
  });
}

async function remove(id) {
  await prisma.invoice.delete({ where: { id } });
  return { id };
}

module.exports = { list, getById, create, update, remove };
