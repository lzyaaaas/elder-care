const bcrypt = require("bcryptjs");

const { prisma } = require("../../config/prisma");
const { generateCode } = require("../../utils/code");
const { buildPagination } = require("../../utils/pagination");

function employeeSelect() {
  return {
    id: true,
    employeeCode: true,
    name: true,
    gender: true,
    maritalStatus: true,
    birthday: true,
    contact: true,
    schedule: true,
    hometown: true,
    position: true,
    email: true,
    role: true,
    status: true,
    createdAt: true,
    updatedAt: true,
    passwordHash: true,
    _count: {
      select: {
        donations: true,
        events: true,
        invoices: true,
        schedules: true,
      },
    },
  };
}

function mapEmployeeRecord(employee) {
  return {
    ...employee,
    passwordConfigured: Boolean(employee.passwordHash),
    passwordHash: undefined,
  };
}

async function list(query) {
  const { page, pageSize, skip, take } = buildPagination(query);
  const search = query.search?.trim();

  const where = search
    ? {
        OR: [
          { employeeCode: { contains: search } },
          { name: { contains: search } },
          { email: { contains: search } },
          { position: { contains: search } },
          { role: { equals: search.toUpperCase() } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    prisma.employee.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      select: employeeSelect(),
    }),
    prisma.employee.count({ where }),
  ]);

  return {
    items: items.map(mapEmployeeRecord),
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

async function getById(id) {
  const employee = await prisma.employee.findUniqueOrThrow({
    where: { id },
    select: employeeSelect(),
  });

  return mapEmployeeRecord(employee);
}

async function create(input) {
  const data = {
    employeeCode: input.employeeCode || generateCode("EMP"),
    name: input.name,
    gender: input.gender,
    maritalStatus: input.maritalStatus,
    birthday: input.birthday,
    contact: input.contact,
    schedule: input.schedule,
    hometown: input.hometown,
    position: input.position,
    email: input.email,
    role: input.role,
    status: input.status,
  };

  if (input.password) {
    data.passwordHash = await bcrypt.hash(input.password, 10);
  }

  const employee = await prisma.employee.create({
    data,
    select: employeeSelect(),
  });

  return mapEmployeeRecord(employee);
}

async function update(id, input) {
  const data = {
    employeeCode: input.employeeCode,
    name: input.name,
    gender: input.gender,
    maritalStatus: input.maritalStatus,
    birthday: input.birthday,
    contact: input.contact,
    schedule: input.schedule,
    hometown: input.hometown,
    position: input.position,
    email: input.email,
    role: input.role,
    status: input.status,
  };

  if (input.password) {
    data.passwordHash = await bcrypt.hash(input.password, 10);
  }

  Object.keys(data).forEach((key) => {
    if (data[key] === undefined) {
      delete data[key];
    }
  });

  const employee = await prisma.employee.update({
    where: { id },
    data,
    select: employeeSelect(),
  });

  return mapEmployeeRecord(employee);
}

async function remove(id) {
  await prisma.employee.delete({
    where: { id },
  });

  return { id };
}

module.exports = { list, getById, create, update, remove };
