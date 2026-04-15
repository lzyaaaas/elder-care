const bcrypt = require("bcryptjs");

const { prisma } = require("../../config/prisma");
const { generateCode } = require("../../utils/code");
const { signDonorToken } = require("../../utils/jwt");

function toAuthUser(donor) {
  return {
    id: donor.id,
    donorCode: donor.donorCode,
    name: `${donor.firstName} ${donor.lastName}`,
    email: donor.email,
    supporterType: donor.supporterType,
    accountStatus: donor.accountStatus,
  };
}

async function register(input) {
  const existingDonor = await prisma.donor.findUnique({
    where: { email: input.email },
    include: {
      _count: {
        select: {
          donations: true,
        },
      },
    },
  });

  if (existingDonor?.passwordHash) {
    const error = new Error("An account already exists for this email.");
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  const donor = existingDonor
    ? await prisma.donor.update({
        where: { id: existingDonor.id },
        data: {
          firstName: input.firstName,
          lastName: input.lastName,
          birthday: input.birthday,
          gender: input.gender,
          maritalStatus: input.maritalStatus,
          phone: input.phone,
          country: input.country,
          state: input.state,
          city: input.city,
          preferredLanguage: input.preferredLanguage,
          passwordHash,
          accountStatus: "ACTIVE",
          supporterType: existingDonor._count?.donations ? "DONOR" : "SUPPORTER",
          sourceEventId: input.sourceEventId || existingDonor.sourceEventId,
          lastLoginAt: new Date(),
        },
      })
    : await prisma.donor.create({
        data: {
          donorCode: generateCode("DON"),
          firstName: input.firstName,
          lastName: input.lastName,
          birthday: input.birthday,
          gender: input.gender,
          maritalStatus: input.maritalStatus,
          email: input.email,
          phone: input.phone,
          country: input.country,
          state: input.state,
          city: input.city,
          preferredLanguage: input.preferredLanguage,
          passwordHash,
          accountStatus: "ACTIVE",
          supporterType: "SUPPORTER",
          sourceEventId: input.sourceEventId,
          lastLoginAt: new Date(),
          registrationDate: new Date(),
        },
      });

  const user = toAuthUser(donor);
  const token = signDonorToken(donor);

  return { token, user };
}

async function login(input) {
  const donor = await prisma.donor.findUnique({
    where: { email: input.email },
  });

  if (!donor || !donor.passwordHash) {
    const error = new Error("Invalid email or password.");
    error.statusCode = 401;
    throw error;
  }

  if (donor.accountStatus !== "ACTIVE") {
    const error = new Error("This donor account is inactive.");
    error.statusCode = 403;
    throw error;
  }

  const isValidPassword = await bcrypt.compare(input.password, donor.passwordHash);

  if (!isValidPassword) {
    const error = new Error("Invalid email or password.");
    error.statusCode = 401;
    throw error;
  }

  const updatedDonor = await prisma.donor.update({
    where: { id: donor.id },
    data: { lastLoginAt: new Date() },
  });

  const user = toAuthUser(updatedDonor);
  const token = signDonorToken(updatedDonor);

  return { token, user };
}

async function getCurrentDonor(donorId) {
  const donor = await prisma.donor.findUnique({
    where: { id: donorId },
  });

  if (!donor) {
    const error = new Error("Donor not found.");
    error.statusCode = 404;
    throw error;
  }

  return toAuthUser(donor);
}

module.exports = { register, login, getCurrentDonor };
