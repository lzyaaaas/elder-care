const { prisma } = require("../../config/prisma");
const { buildPagination } = require("../../utils/pagination");

async function list(query) {
  const { page, pageSize, skip, take } = buildPagination(query);
  const search = query.search?.trim();
  const where = search
    ? {
        OR: [
          { eventName: { contains: search } },
          { city: { contains: search } },
          { country: { contains: search } },
          { employee: { name: { contains: search } } },
        ],
      }
    : {};
  const [items, total] = await Promise.all([
    prisma.event.findMany({ where, skip, take, orderBy: { startDate: "desc" }, include: { employee: true } }),
    prisma.event.count({ where }),
  ]);
  return { items, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
}

async function getById(id) {
  return prisma.event.findUniqueOrThrow({
    where: { id },
    include: { employee: true, promotions: true, assignments: true, donations: true },
  });
}

async function create(input) {
  return prisma.event.create({ data: input, include: { employee: true } });
}

async function update(id, input) {
  return prisma.event.update({ where: { id }, data: input, include: { employee: true } });
}

async function remove(id) {
  await prisma.event.delete({ where: { id } });
  return { id };
}

module.exports = { list, getById, create, update, remove };
