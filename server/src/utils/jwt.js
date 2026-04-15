const jwt = require("jsonwebtoken");

const { env } = require("../config/env");

function signToken(payload) {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
}

function signEmployeeToken(employee) {
  return signToken({
    accountType: employee.role === "ADMIN" ? "ADMIN" : "EMPLOYEE",
    id: employee.id,
    employeeCode: employee.employeeCode,
    name: employee.name,
    email: employee.email,
    role: employee.role,
    status: employee.status,
  });
}

function signDonorToken(donor) {
  return signToken({
    accountType: "DONOR",
    id: donor.id,
    donorCode: donor.donorCode,
    name: `${donor.firstName} ${donor.lastName}`,
    email: donor.email,
    supporterType: donor.supporterType,
    accountStatus: donor.accountStatus,
  });
}

function verifyToken(token) {
  return jwt.verify(token, env.JWT_SECRET);
}

module.exports = { signToken, signEmployeeToken, signDonorToken, verifyToken };
