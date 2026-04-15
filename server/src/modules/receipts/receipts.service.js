const { prisma } = require("../../config/prisma");
const { generateCode } = require("../../utils/code");
const { buildPagination } = require("../../utils/pagination");

async function list(query) {
  const { page, pageSize, skip, take } = buildPagination(query);
  const search = query.search?.trim();

  const where = search
    ? {
        OR: [
          { receiptNumber: { contains: search } },
          { donation: { donationCode: { contains: search } } },
          { donation: { donor: { firstName: { contains: search } } } },
          { donation: { donor: { lastName: { contains: search } } } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    prisma.donationReceipt.findMany({
      where,
      skip,
      take,
      orderBy: { receiptDate: "desc" },
      include: {
        donation: {
          include: {
            donor: true,
          },
        },
      },
    }),
    prisma.donationReceipt.count({ where }),
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
  return prisma.donationReceipt.findUniqueOrThrow({
    where: { id },
    include: {
      donation: {
        include: {
          donor: true,
          event: true,
          donationKit: true,
        },
      },
    },
  });
}

async function create(input) {
  return prisma.donationReceipt.create({
    data: {
      ...input,
      receiptNumber: input.receiptNumber || generateCode("RCPT"),
    },
    include: {
      donation: {
        include: {
          donor: true,
        },
      },
    },
  });
}

async function update(id, input) {
  return prisma.donationReceipt.update({
    where: { id },
    data: input,
    include: {
      donation: {
        include: {
          donor: true,
        },
      },
    },
  });
}

async function remove(id) {
  await prisma.donationReceipt.delete({
    where: { id },
  });

  return { id };
}

module.exports = { list, getById, create, update, remove };
