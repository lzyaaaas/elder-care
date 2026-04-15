const { prisma } = require("../../config/prisma");
const { generateCode } = require("../../utils/code");
const { buildPagination } = require("../../utils/pagination");

async function list(query) {
  const { page, pageSize, skip, take } = buildPagination(query);
  const search = query.search?.trim();

  const where = search
    ? {
        OR: [
          { donationCode: { contains: search } },
          { donor: { firstName: { contains: search } } },
          { donor: { lastName: { contains: search } } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    prisma.donationReceivable.findMany({
      where,
      skip,
      take,
      orderBy: { donationDate: "desc" },
      include: {
        donor: true,
        event: true,
        donationKit: true,
        employee: true,
      },
    }),
    prisma.donationReceivable.count({ where }),
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
  return prisma.donationReceivable.findUniqueOrThrow({
    where: { id },
    include: {
      donor: true,
      event: true,
      donationKit: true,
      employee: true,
      receipts: true,
      shippings: true,
      feedbacks: true,
    },
  });
}

async function create(input) {
  return prisma.donationReceivable.create({
    data: {
      ...input,
      donationCode: input.donationCode || generateCode("DR"),
    },
    include: {
      donor: true,
      event: true,
      donationKit: true,
      employee: true,
    },
  });
}

async function update(id, input) {
  return prisma.donationReceivable.update({
    where: { id },
    data: input,
    include: {
      donor: true,
      event: true,
      donationKit: true,
      employee: true,
    },
  });
}

async function remove(id) {
  await prisma.donationReceivable.delete({
    where: { id },
  });

  return { id };
}

module.exports = { list, getById, create, update, remove };
