const bcrypt = require("bcryptjs");

const { prisma } = require("../../config/prisma");
const { signEmployeeToken } = require("../../utils/jwt");

function toAuthUser(employee) {
  return {
    accountType: employee.role === "ADMIN" ? "ADMIN" : "EMPLOYEE",
    id: employee.id,
    employeeCode: employee.employeeCode,
    name: employee.name,
    email: employee.email,
    role: employee.role,
    status: employee.status,
  };
}

async function login(input) {
  const employee = await prisma.employee.findUnique({
    where: { email: input.email },
  });

  if (!employee || !employee.passwordHash) {
    const error = new Error("Invalid email or password.");
    error.statusCode = 401;
    throw error;
  }

  if (employee.status !== "ACTIVE") {
    const error = new Error("This account is inactive.");
    error.statusCode = 403;
    throw error;
  }

  const isValidPassword = await bcrypt.compare(input.password, employee.passwordHash);

  if (!isValidPassword) {
    const error = new Error("Invalid email or password.");
    error.statusCode = 401;
    throw error;
  }

  const user = toAuthUser(employee);
  const token = signEmployeeToken(employee);

  return { token, user };
}

async function getCurrentUser(userId) {
  const employee = await prisma.employee.findUnique({
    where: { id: userId },
  });

  if (!employee) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  return toAuthUser(employee);
}

module.exports = { login, getCurrentUser };
