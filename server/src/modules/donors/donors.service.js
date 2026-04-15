const { prisma } = require("../../config/prisma");
const { generateCode } = require("../../utils/code");
const { buildPagination } = require("../../utils/pagination");

async function list(query) {
  const { page, pageSize, skip, take } = buildPagination(query);
  const search = query.search?.trim();

  const where = search
    ? {
        OR: [
          { firstName: { contains: search } },
          { lastName: { contains: search } },
          { donorCode: { contains: search } },
          { email: { contains: search } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    prisma.donor.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: {
        sourceEvent: true,
      },
    }),
    prisma.donor.count({ where }),
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
  return prisma.donor.findUniqueOrThrow({
    where: { id },
    include: {
      sourceEvent: true,
      donations: {
        orderBy: { donationDate: "desc" },
      },
    },
  });
}

async function create(input) {
  return prisma.donor.create({
    data: {
      ...input,
      donorCode: input.donorCode || generateCode("DON"),
      supporterType: input.supporterType || "DONOR",
      accountStatus: input.accountStatus || "INACTIVE",
      registrationDate: input.registrationDate || new Date(),
    },
  });
}

async function update(id, input) {
  return prisma.donor.update({
    where: { id },
    data: input,
  });
}

async function remove(id) {
  await prisma.donor.delete({
    where: { id },
  });

  return { id };
}

module.exports = { list, getById, create, update, remove };
