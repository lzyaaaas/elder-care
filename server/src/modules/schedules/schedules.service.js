const { prisma } = require("../../config/prisma");
const { buildPagination } = require("../../utils/pagination");

async function list(query) {
  const { page, pageSize, skip, take } = buildPagination(query);
  const search = query.search?.trim();

  const where = search
    ? {
        OR: [
          { employee: { name: { contains: search } } },
          { event: { eventName: { contains: search } } },
          { status: { equals: search.toUpperCase() } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    prisma.schedule.findMany({
      where,
      skip,
      take,
      orderBy: [{ shiftDate: "asc" }, { startTime: "asc" }],
      include: {
        employee: true,
        event: true,
      },
    }),
    prisma.schedule.count({ where }),
  ]);

  return {
    items,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

async function getById(id) {
  return prisma.schedule.findUniqueOrThrow({
    where: { id },
    include: {
      employee: true,
      event: true,
    },
  });
}

async function create(input) {
  return prisma.schedule.create({
    data: input,
    include: {
      employee: true,
      event: true,
    },
  });
}

async function update(id, input) {
  return prisma.schedule.update({
    where: { id },
    data: input,
    include: {
      employee: true,
      event: true,
    },
  });
}

async function remove(id) {
  await prisma.schedule.delete({
    where: { id },
  });

  return { id };
}

module.exports = { list, getById, create, update, remove };
