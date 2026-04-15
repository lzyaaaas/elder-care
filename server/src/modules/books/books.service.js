const { prisma } = require("../../config/prisma");
const { buildPagination } = require("../../utils/pagination");

async function list(query) {
  const { page, pageSize, skip, take } = buildPagination(query);
  const search = query.search?.trim();
  const where = search
    ? {
        OR: [
          { title: { contains: search } },
          { press: { pressName: { contains: search } } },
          { bookSeries: { seriesName: { contains: search } } },
          { bookFormat: { formatType: { contains: search } } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    prisma.book.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: { press: true, bookSeries: true, bookFormat: true },
    }),
    prisma.book.count({ where }),
  ]);

  return { items, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
}

async function getById(id) {
  return prisma.book.findUniqueOrThrow({ where: { id }, include: { press: true, bookSeries: true, bookFormat: true, kitComponents: true } });
}

async function create(input) {
  return prisma.book.create({ data: input, include: { press: true, bookSeries: true, bookFormat: true } });
}

async function update(id, input) {
  return prisma.book.update({ where: { id }, data: input, include: { press: true, bookSeries: true, bookFormat: true } });
}

async function remove(id) {
  await prisma.book.delete({ where: { id } });
  return { id };
}

module.exports = { list, getById, create, update, remove };
