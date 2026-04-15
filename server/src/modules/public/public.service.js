const bcrypt = require("bcryptjs");

const { prisma } = require("../../config/prisma");
const { generateCode } = require("../../utils/code");

async function listPublicEvents() {
  return prisma.event.findMany({
    where: { isActive: true },
    orderBy: { startDate: "asc" },
    select: {
      id: true,
      eventName: true,
      startDate: true,
      city: true,
      country: true,
      type: true,
    },
  });
}

async function createDonation(input) {
  const existingDonor = input.email
    ? await prisma.donor.findUnique({
        where: { email: input.email },
      })
    : null;

  if (input.createAccount && !input.email) {
    const error = new Error("Email is required to create a donor account.");
    error.statusCode = 400;
    throw error;
  }

  if (input.createAccount && !input.password) {
    const error = new Error("Password is required to create a donor account.");
    error.statusCode = 400;
    throw error;
  }

  if (input.createAccount && existingDonor?.passwordHash) {
    const error = new Error("An account already exists for this email. Please sign in or donate without creating a new account.");
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = input.createAccount && input.password ? await bcrypt.hash(input.password, 10) : null;

  const donorData = {
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
    supporterType: "DONOR",
    sourceEventId: input.sourceEventId || input.eventId || null,
  };

  if (input.createAccount) {
    donorData.passwordHash = passwordHash;
    donorData.accountStatus = "ACTIVE";
    donorData.lastLoginAt = new Date();
  }

  const finalDonor = existingDonor
    ? await prisma.donor.update({
        where: { id: existingDonor.id },
        data: donorData,
      })
    : await prisma.donor.create({
        data: {
          donorCode: generateCode("DON"),
          registrationDate: new Date(),
          accountStatus: input.createAccount ? "ACTIVE" : "INACTIVE",
          ...donorData,
        },
      });

  return prisma.donationReceivable.create({
    data: {
      donationCode: generateCode("DR"),
      donorId: finalDonor.id,
      eventId: input.eventId,
      donationAmount: input.donationAmount,
      donationDate: input.donationDate || new Date(),
      donationFrequency: input.donationFrequency || "ONE_TIME",
      status: "PENDING",
      donationKitId: input.donationKitId,
      notes: input.notes,
    },
    include: {
      donor: true,
      donationKit: true,
      event: true,
    },
  });
}

async function createFeedback(input) {
  let donationId = input.donationId;

  if (!donationId && input.donationCode) {
    const donation = await prisma.donationReceivable.findUnique({
      where: { donationCode: input.donationCode },
    });

    if (!donation) {
      const error = new Error("Donation not found.");
      error.statusCode = 404;
      throw error;
    }

    donationId = donation.id;
  }

  if (!donationId) {
    const error = new Error("donationId or donationCode is required.");
    error.statusCode = 400;
    throw error;
  }

  return prisma.feedback.create({
    data: {
      donationId,
      feedbackContent: input.feedbackContent,
      rating: input.rating,
      feedbackDate: input.feedbackDate || new Date(),
      status: "NEW",
    },
  });
}

module.exports = { listPublicEvents, createDonation, createFeedback };
