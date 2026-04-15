const bcrypt = require("bcryptjs");

const { prisma } = require("../../config/prisma");

async function getDashboard(employeeId) {
  const [employee, upcomingSchedules, upcomingEventsCount, shippingTasksCount, followUpsCount] =
    await Promise.all([
    prisma.employee.findUniqueOrThrow({
      where: { id: employeeId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        position: true,
        contact: true,
        _count: {
          select: {
            donations: true,
            events: true,
            invoices: true,
            schedules: true,
          },
        },
      },
    }),
    prisma.schedule.findMany({
      where: {
        employeeId,
        shiftDate: {
          gte: new Date(new Date().toDateString()),
        },
      },
      orderBy: [{ shiftDate: "asc" }, { startTime: "asc" }],
      take: 5,
      include: {
        event: true,
      },
    }),
    prisma.event.count({
      where: {
        employeeId,
        startDate: {
          gte: new Date(new Date().toDateString()),
        },
      },
    }),
    prisma.shipping.count({
      where: {
        donation: {
          employeeId,
          status: {
            in: ["CONFIRMED", "RECEIPTED", "SHIPPED"],
          },
        },
      },
    }),
    prisma.feedback.count({
      where: {
        donation: {
          employeeId,
        },
        status: {
          in: ["NEW", "REVIEWED"],
        },
      },
    }),
  ]);

  return {
    employee,
    upcomingSchedules,
    taskSummary: {
      upcomingEventsCount,
      shippingTasksCount,
      followUpsCount,
    },
  };
}

async function getMe(employeeId) {
  return prisma.employee.findUniqueOrThrow({
    where: { id: employeeId },
    select: {
      id: true,
      employeeCode: true,
      name: true,
      email: true,
      gender: true,
      maritalStatus: true,
      birthday: true,
      contact: true,
      hometown: true,
      position: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

async function updateMe(employeeId, input) {
  return prisma.employee.update({
    where: { id: employeeId },
    data: input,
    select: {
      id: true,
      employeeCode: true,
      name: true,
      email: true,
      gender: true,
      maritalStatus: true,
      birthday: true,
      contact: true,
      hometown: true,
      position: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

async function updatePassword(employeeId, input) {
  const employee = await prisma.employee.findUniqueOrThrow({
    where: { id: employeeId },
    select: {
      id: true,
      passwordHash: true,
    },
  });

  if (!employee.passwordHash) {
    const error = new Error("This account has no existing password.");
    error.statusCode = 400;
    throw error;
  }

  const isValidPassword = await bcrypt.compare(input.currentPassword, employee.passwordHash);

  if (!isValidPassword) {
    const error = new Error("Current password is incorrect.");
    error.statusCode = 401;
    throw error;
  }

  const passwordHash = await bcrypt.hash(input.newPassword, 10);

  await prisma.employee.update({
    where: { id: employeeId },
    data: { passwordHash },
  });

  return { id: employeeId };
}

async function listSchedule(employeeId, query) {
  const filter = query.filter || "all";
  const today = new Date(new Date().toDateString());

  const where = {
    employeeId,
  };

  if (filter === "upcoming") {
    where.shiftDate = { gte: today };
  }

  if (filter === "completed") {
    where.status = "COMPLETED";
  }

  if (filter === "cancelled") {
    where.status = "CANCELLED";
  }

  return prisma.schedule.findMany({
    where,
    orderBy: [{ shiftDate: "asc" }, { startTime: "asc" }],
    include: {
      event: true,
    },
  });
}

async function getScheduleById(employeeId, scheduleId) {
  const schedule = await prisma.schedule.findUniqueOrThrow({
    where: { id: scheduleId },
    include: {
      event: true,
      employee: true,
    },
  });

  if (schedule.employeeId !== employeeId) {
    const error = new Error("Schedule not found for this employee.");
    error.statusCode = 404;
    throw error;
  }

  return schedule;
}

async function listEvents(employeeId) {
  return prisma.event.findMany({
    where: { employeeId },
    orderBy: [{ startDate: "asc" }],
    include: {
      schedules: {
        orderBy: [{ shiftDate: "asc" }, { startTime: "asc" }],
      },
    },
  });
}

async function listDonations(employeeId) {
  return prisma.donationReceivable.findMany({
    where: { employeeId },
    orderBy: [{ donationDate: "desc" }],
    include: {
      donor: true,
      event: true,
      donationKit: true,
      receipts: true,
    },
  });
}

async function listShippingTasks(employeeId) {
  return prisma.shipping.findMany({
    where: {
      donation: {
        employeeId,
      },
    },
    orderBy: [{ shippedDate: "desc" }, { createdAt: "desc" }],
    include: {
      donation: {
        include: {
          donor: true,
          event: true,
        },
      },
    },
  });
}

async function listFollowUps(employeeId) {
  return prisma.feedback.findMany({
    where: {
      donation: {
        employeeId,
      },
    },
    orderBy: [{ feedbackDate: "desc" }],
    include: {
      donation: {
        include: {
          donor: true,
          event: true,
        },
      },
    },
  });
}

module.exports = {
  getDashboard,
  getMe,
  updateMe,
  updatePassword,
  listSchedule,
  getScheduleById,
  listEvents,
  listDonations,
  listShippingTasks,
  listFollowUps,
};
