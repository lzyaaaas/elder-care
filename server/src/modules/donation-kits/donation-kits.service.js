const { prisma } = require("../../config/prisma");
const { generateCode } = require("../../utils/code");
const { buildPagination } = require("../../utils/pagination");

async function list(query) {
  const { page, pageSize, skip, take } = buildPagination(query);
  const search = query.search?.trim();
  const where = search
    ? {
        OR: [{ kitCode: { contains: search } }, { kitName: { contains: search } }, { description: { contains: search } }],
      }
    : {};

  const [items, total] = await Promise.all([
    prisma.donationKit.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: {
        components: {
          include: { book: true, box: true, envelope: true },
        },
      },
    }),
    prisma.donationKit.count({ where }),
  ]);

  return { items, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
}

async function getById(id) {
  return prisma.donationKit.findUniqueOrThrow({
    where: { id },
    include: {
      components: { include: { book: true, box: true, envelope: true } },
      donations: true,
    },
  });
}

async function create(input) {
  return prisma.donationKit.create({
    data: { ...input, kitCode: input.kitCode || generateCode("KIT") },
    include: { components: true },
  });
}

async function update(id, input) {
  return prisma.donationKit.update({
    where: { id },
    data: input,
    include: { components: true },
  });
}

async function remove(id) {
  await prisma.donationKit.delete({ where: { id } });
  return { id };
}

module.exports = { list, getById, create, update, remove };
