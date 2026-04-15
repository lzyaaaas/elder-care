const { prisma } = require("../../config/prisma");

function toNumber(value) {
  return Number(value || 0);
}

function formatMonthKey(dateValue) {
  const date = new Date(dateValue);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  return `${year}-${month}`;
}

function buildMonthlyDonationTrend(donations) {
  const grouped = donations.reduce((accumulator, donation) => {
    const key = formatMonthKey(donation.donationDate);

    if (!accumulator[key]) {
      accumulator[key] = {
        month: key,
        donationCount: 0,
        donationValue: 0,
      };
    }

    accumulator[key].donationCount += 1;
    accumulator[key].donationValue += toNumber(donation.donationAmount);
    return accumulator;
  }, {});

  return Object.values(grouped).sort((left, right) => left.month.localeCompare(right.month));
}

function buildCountMap(items, keyName, fallback = "UNKNOWN") {
  return items.reduce((accumulator, item) => {
    const key = item[keyName] || fallback;
    accumulator[key] = (accumulator[key] || 0) + 1;
    return accumulator;
  }, {});
}

function mapCountsToSeries(countMap) {
  return Object.entries(countMap)
    .map(([label, value]) => ({ label, value }))
    .sort((left, right) => right.value - left.value);
}

function buildRatingSeries(feedbackItems) {
  const ratingMap = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  feedbackItems.forEach((item) => {
    if (item.rating && ratingMap[item.rating] !== undefined) {
      ratingMap[item.rating] += 1;
    }
  });

  return Object.entries(ratingMap).map(([label, value]) => ({
    label: `${label} star`,
    value,
  }));
}

function buildInventoryAlerts(groups) {
  return groups
    .flatMap((group) =>
      group.items
        .filter((item) => item.currentStock <= item.reorderLevel)
        .map((item) => ({
          type: group.type,
          name: group.getName(item),
          currentStock: item.currentStock,
          reorderLevel: item.reorderLevel,
          severity:
            item.currentStock === 0
              ? "critical"
              : item.currentStock <= Math.max(1, Math.floor(item.reorderLevel / 2))
                ? "high"
                : "medium",
        })),
    )
    .sort((left, right) => left.currentStock - right.currentStock);
}

async function getSummary() {
  const [
    totalDonors,
    totalDonations,
    totalDonationValue,
    totalFeedback,
    totalEvents,
    openPayables,
  ] = await Promise.all([
    prisma.donor.count(),
    prisma.donationReceivable.count(),
    prisma.donationReceivable.aggregate({
      _sum: { donationAmount: true },
    }),
    prisma.feedback.count(),
    prisma.event.count(),
    prisma.payable.count({
      where: {
        status: {
          in: ["OPEN", "PARTIALLY_PAID", "OVERDUE"],
        },
      },
    }),
  ]);

  return {
    totalDonors,
    totalDonations,
    totalDonationValue: totalDonationValue._sum.donationAmount || 0,
    totalFeedback,
    totalEvents,
    openPayables,
  };
}

async function getAnalytics() {
  const [
    summary,
    donors,
    donations,
    shippings,
    feedbackItems,
    books,
    envelopes,
    boxes,
    promotionInventory,
    events,
    invoicesAggregate,
    invoiceCount,
    payableAggregate,
    openPayables,
  ] = await Promise.all([
    getSummary(),
    prisma.donor.findMany({
      select: {
        gender: true,
        preferredLanguage: true,
        country: true,
      },
    }),
    prisma.donationReceivable.findMany({
      select: {
        donationDate: true,
        donationAmount: true,
        status: true,
      },
      orderBy: { donationDate: "asc" },
    }),
    prisma.shipping.findMany({
      select: {
        status: true,
      },
    }),
    prisma.feedback.findMany({
      select: {
        rating: true,
        status: true,
      },
    }),
    prisma.book.findMany({
      select: {
        title: true,
        currentStock: true,
        reorderLevel: true,
      },
    }),
    prisma.envelope.findMany({
      where: { isActive: true },
      select: {
        envelopeCode: true,
        currentStock: true,
        reorderLevel: true,
      },
    }),
    prisma.box.findMany({
      where: { isActive: true },
      select: {
        boxCode: true,
        currentStock: true,
        reorderLevel: true,
      },
    }),
    prisma.promotionInventory.findMany({
      where: { isActive: true },
      select: {
        inventoryCode: true,
        promotionInventoryType: true,
        currentStock: true,
        reorderLevel: true,
      },
    }),
    prisma.event.findMany({
      select: {
        startDate: true,
        isActive: true,
      },
    }),
    prisma.invoice.aggregate({
      _sum: {
        totalAmount: true,
      },
    }),
    prisma.invoice.count(),
    prisma.payable.aggregate({
      _sum: {
        remainingAmount: true,
      },
    }),
    prisma.payable.findMany({
      where: {
        status: {
          in: ["OPEN", "PARTIALLY_PAID", "OVERDUE"],
        },
      },
      select: {
        status: true,
        remainingAmount: true,
      },
    }),
  ]);

  const now = new Date();
  const shippingStatus = mapCountsToSeries(buildCountMap(shippings, "status"));
  const donorDemographics = {
    byGender: mapCountsToSeries(buildCountMap(donors, "gender")),
    byLanguage: mapCountsToSeries(buildCountMap(donors, "preferredLanguage")),
    byCountry: mapCountsToSeries(buildCountMap(donors, "country")),
  };

  const feedbackAverage =
    feedbackItems.length > 0
      ? feedbackItems.reduce((total, item) => total + toNumber(item.rating), 0) / feedbackItems.length
      : 0;

  const lowStockAlerts = buildInventoryAlerts([
    {
      type: "Book",
      items: books,
      getName: (item) => item.title,
    },
    {
      type: "Envelope",
      items: envelopes,
      getName: (item) => item.envelopeCode,
    },
    {
      type: "Box",
      items: boxes,
      getName: (item) => item.boxCode,
    },
    {
      type: "Promotion",
      items: promotionInventory,
      getName: (item) => `${item.promotionInventoryType} (${item.inventoryCode})`,
    },
  ]).slice(0, 8);

  const upcomingEvents = events.filter((event) => new Date(event.startDate) >= now).length;
  const activeEvents = events.filter((event) => event.isActive).length;
  const outstandingPayablesAmount = openPayables.reduce(
    (total, payable) => total + toNumber(payable.remainingAmount),
    0,
  );

  return {
    summary: {
      ...summary,
      totalInvoices: invoiceCount,
      outstandingPayablesAmount,
      averageFeedbackRating: Number(feedbackAverage.toFixed(1)),
    },
    donationTrend: buildMonthlyDonationTrend(donations),
    donorDemographics,
    shippingStatus,
    feedbackSummary: {
      averageRating: Number(feedbackAverage.toFixed(1)),
      byRating: buildRatingSeries(feedbackItems),
      byStatus: mapCountsToSeries(buildCountMap(feedbackItems, "status")),
    },
    inventoryAlerts: lowStockAlerts,
    eventSummary: {
      totalEvents: events.length,
      activeEvents,
      upcomingEvents,
    },
    financeOverview: {
      totalInvoiceAmount: toNumber(invoicesAggregate._sum.totalAmount),
      outstandingPayablesAmount,
      donationValue: toNumber(summary.totalDonationValue),
      revenueVsCost: [
        {
          label: "Donations",
          value: toNumber(summary.totalDonationValue),
        },
        {
          label: "Invoice Cost",
          value: toNumber(invoicesAggregate._sum.totalAmount),
        },
        {
          label: "Outstanding Payables",
          value: outstandingPayablesAmount,
        },
      ],
      payableStatuses: mapCountsToSeries(buildCountMap(openPayables, "status")),
    },
  };
}

module.exports = { getSummary, getAnalytics };
