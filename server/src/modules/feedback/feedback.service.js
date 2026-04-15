const { prisma } = require("../../config/prisma");
const { buildPagination } = require("../../utils/pagination");

async function list(query) {
  const { page, pageSize, skip, take } = buildPagination(query);
  const search = query.search?.trim();

  const where = search
    ? {
        OR: [
          { feedbackContent: { contains: search } },
          { donation: { donationCode: { contains: search } } },
          { donation: { donor: { firstName: { contains: search } } } },
          { donation: { donor: { lastName: { contains: search } } } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    prisma.feedback.findMany({
      where,
      skip,
      take,
      orderBy: { feedbackDate: "desc" },
      include: {
        donation: {
          include: {
            donor: true,
          },
        },
      },
    }),
    prisma.feedback.count({ where }),
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
  return prisma.feedback.findUniqueOrThrow({
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
  return prisma.feedback.create({
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

async function update(id, input) {
  return prisma.feedback.update({
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
  await prisma.feedback.delete({
    where: { id },
  });

  return { id };
}

module.exports = { list, getById, create, update, remove };
