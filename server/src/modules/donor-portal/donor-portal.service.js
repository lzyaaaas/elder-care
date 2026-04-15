const { prisma } = require("../../config/prisma");

async function getProfile(donorId) {
  return prisma.donor.findUniqueOrThrow({
    where: { id: donorId },
    include: {
      sourceEvent: true,
    },
  });
}

async function updateProfile(donorId, input) {
  return prisma.donor.update({
    where: { id: donorId },
    data: input,
    include: {
      sourceEvent: true,
    },
  });
}

async function listDonations(donorId) {
  return prisma.donationReceivable.findMany({
    where: { donorId },
    orderBy: { donationDate: "desc" },
    include: {
      event: true,
      donationKit: true,
    },
  });
}

async function listReceipts(donorId) {
  return prisma.donationReceipt.findMany({
    where: {
      donation: {
        donorId,
      },
    },
    orderBy: { receiptDate: "desc" },
    include: {
      donation: true,
    },
  });
}

async function listShipping(donorId) {
  return prisma.shipping.findMany({
    where: {
      donation: {
        donorId,
      },
    },
    orderBy: { createdAt: "desc" },
    include: {
      donation: true,
    },
  });
}

async function listFeedback(donorId) {
  return prisma.feedback.findMany({
    where: {
      donation: {
        donorId,
      },
    },
    orderBy: { feedbackDate: "desc" },
    include: {
      donation: true,
    },
  });
}

async function createFeedback(donorId, input) {
  const donation = await prisma.donationReceivable.findFirst({
    where: {
      id: input.donationId,
      donorId,
    },
  });

  if (!donation) {
    const error = new Error("Donation not found for this donor.");
    error.statusCode = 404;
    throw error;
  }

  return prisma.feedback.create({
    data: {
      donationId: donation.id,
      feedbackContent: input.feedbackContent,
      rating: input.rating,
      feedbackDate: input.feedbackDate || new Date(),
      status: "NEW",
    },
    include: {
      donation: true,
    },
  });
}

module.exports = {
  getProfile,
  updateProfile,
  listDonations,
  listReceipts,
  listShipping,
  listFeedback,
  createFeedback,
};
