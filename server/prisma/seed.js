require("dotenv").config();

const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10);
  const employeePasswordHash = await bcrypt.hash("employee123", 10);
  const donorPasswordHash = await bcrypt.hash("donor123", 10);

  const admin = await prisma.employee.upsert({
    where: { employeeCode: "EMP-ADMIN-001" },
    update: {
      email: "admin@example.org",
      passwordHash,
      role: "ADMIN",
      status: "ACTIVE",
      maritalStatus: "MARRIED",
    },
    create: {
      employeeCode: "EMP-ADMIN-001",
      name: "System Admin",
      email: "admin@example.org",
      passwordHash,
      role: "ADMIN",
      status: "ACTIVE",
      maritalStatus: "MARRIED",
      position: "Administrator",
      hometown: "Shanghai",
      contact: "+86-13800009999",
      schedule: "Mon-Fri",
    },
  });

  const operationsEmployee = await prisma.employee.upsert({
    where: { employeeCode: "EMP-OPS-001" },
    update: {
      email: "operations@example.org",
      passwordHash: employeePasswordHash,
      role: "OPERATIONS",
      status: "ACTIVE",
      gender: "FEMALE",
      maritalStatus: "SINGLE",
      position: "Campaign Coordinator",
    },
    create: {
      employeeCode: "EMP-OPS-001",
      name: "Amy Wu",
      email: "operations@example.org",
      passwordHash: employeePasswordHash,
      role: "OPERATIONS",
      status: "ACTIVE",
      gender: "FEMALE",
      maritalStatus: "SINGLE",
      position: "Campaign Coordinator",
      hometown: "Suzhou",
      contact: "+86-13800008888",
      schedule: "Tue-Sat",
    },
  });

  const additionalEmployeeSeeds = [
    {
      employeeCode: "EMP-EVT-002",
      name: "Kevin Fang",
      email: "kevin.fang@example.org",
      role: "EVENT",
      status: "ACTIVE",
      gender: "MALE",
      maritalStatus: "MARRIED",
      position: "Event Lead",
      hometown: "Hangzhou",
      contact: "+86-13800007771",
      schedule: "Wed-Sun",
    },
    {
      employeeCode: "EMP-FIN-001",
      name: "Nina Xu",
      email: "nina.xu@example.org",
      role: "FINANCE",
      status: "ACTIVE",
      gender: "FEMALE",
      maritalStatus: "MARRIED",
      position: "Finance Coordinator",
      hometown: "Shanghai",
      contact: "+86-13800007772",
      schedule: "Mon-Fri",
    },
    {
      employeeCode: "EMP-VOL-001",
      name: "Leo Shen",
      email: "leo.shen@example.org",
      role: "VOLUNTEER",
      status: "ACTIVE",
      gender: "MALE",
      maritalStatus: "PREFER_NOT_TO_SAY",
      position: "Volunteer Support",
      hometown: "Suzhou",
      contact: "+86-13800007773",
      schedule: "Weekend",
    },
  ];

  const extraEmployees = [];
  for (const employeeSeed of additionalEmployeeSeeds) {
    const seededEmployee = await prisma.employee.upsert({
      where: { employeeCode: employeeSeed.employeeCode },
      update: {
        ...employeeSeed,
        passwordHash: employeePasswordHash,
      },
      create: {
        ...employeeSeed,
        passwordHash: employeePasswordHash,
      },
    });

    extraEmployees.push(seededEmployee);
  }

  const donor = await prisma.donor.upsert({
    where: { donorCode: "DON-DEMO-001" },
    update: {
      birthday: new Date("1994-06-01"),
      gender: "FEMALE",
      maritalStatus: "SINGLE",
      passwordHash: donorPasswordHash,
      accountStatus: "ACTIVE",
      supporterType: "DONOR",
      lastLoginAt: new Date("2026-04-02"),
    },
    create: {
      donorCode: "DON-DEMO-001",
      firstName: "Demo",
      lastName: "Donor",
      birthday: new Date("1994-06-01"),
      gender: "FEMALE",
      maritalStatus: "SINGLE",
      country: "China",
      city: "Shanghai",
      email: "demo.donor@example.org",
      preferredLanguage: "zh-CN",
      passwordHash: donorPasswordHash,
      accountStatus: "ACTIVE",
      supporterType: "DONOR",
      lastLoginAt: new Date("2026-04-02"),
      registrationDate: new Date("2026-04-01"),
    },
  });

  const kit = await prisma.donationKit.upsert({
    where: { kitCode: "KIT-DEMO-001" },
    update: {},
    create: {
      kitCode: "KIT-DEMO-001",
      kitName: "Demo Story Kit",
      description: "Starter demo kit for local development.",
      isActive: true,
    },
  });

  const press = await prisma.press.upsert({
    where: { pressName: "Creators Press" },
    update: {},
    create: {
      pressName: "Creators Press",
      description: "Demo publishing partner for the campaign.",
      contactPerson: "Lina Chen",
      phoneNumber: "+86-13800001111",
      email: "press@example.org",
    },
  });

  const series = await prisma.bookSeries.upsert({
    where: { seriesName: "Creators Story Collection" },
    update: {},
    create: {
      seriesName: "Creators Story Collection",
      description: "Story-led campaign titles created for donor outreach.",
    },
  });

  const format = await prisma.bookFormat.upsert({
    where: {
      formatType_language: {
        formatType: "HARDCOVER",
        language: "EN",
      },
    },
    update: {},
    create: {
      formatType: "HARDCOVER",
      language: "EN",
      fileSizeMb: 18.5,
      isAvailable: true,
    },
  });

  let book = await prisma.book.findFirst({
    where: {
      title: "Chao Feng and Maui in: Making Friends",
      pressId: press.id,
      bookFormatId: format.id,
    },
  });

  if (!book) {
    book = await prisma.book.create({
      data: {
        pressId: press.id,
        bookSeriesId: series.id,
        title: "Chao Feng and Maui in: Making Friends",
        bookFormatId: format.id,
        description: "Main campaign storybook edition.",
        pageCount: 32,
        unitCost: 18,
        currentStock: 240,
        reorderLevel: 50,
        publicationDate: new Date("2026-03-15"),
      },
    });
  }

  const envelope = await prisma.envelope.upsert({
    where: { envelopeCode: "ENV-DEMO-001" },
    update: {},
    create: {
      envelopeCode: "ENV-DEMO-001",
      size: "A5",
      unitCost: 1.2,
      currentStock: 500,
      reorderLevel: 100,
      description: "Cream donor letter envelope.",
      lastRestockDate: new Date("2026-03-25"),
      isActive: true,
    },
  });

  const box = await prisma.box.upsert({
    where: { boxCode: "BOX-DEMO-001" },
    update: {},
    create: {
      boxCode: "BOX-DEMO-001",
      size: "Small",
      unitCost: 4.5,
      currentStock: 180,
      reorderLevel: 40,
      description: "Presentation gift box for donors.",
      lastRestockDate: new Date("2026-03-26"),
      isActive: true,
    },
  });

  const existingBookComponent = await prisma.kitComponent.findFirst({
    where: { donationKitId: kit.id, componentType: "BOOK", bookId: book.id },
  });

  if (!existingBookComponent) {
    await prisma.kitComponent.create({
      data: {
        donationKitId: kit.id,
        componentType: "BOOK",
        quantity: 1,
        bookId: book.id,
        description: "Storybook included in the demo donor kit.",
      },
    });
  }

  const existingEnvelopeComponent = await prisma.kitComponent.findFirst({
    where: { donationKitId: kit.id, componentType: "ENVELOPE", envelopeId: envelope.id },
  });

  if (!existingEnvelopeComponent) {
    await prisma.kitComponent.create({
      data: {
        donationKitId: kit.id,
        componentType: "ENVELOPE",
        quantity: 1,
        envelopeId: envelope.id,
        description: "Donor letter envelope.",
      },
    });
  }

  const existingBoxComponent = await prisma.kitComponent.findFirst({
    where: { donationKitId: kit.id, componentType: "BOX", boxId: box.id },
  });

  if (!existingBoxComponent) {
    await prisma.kitComponent.create({
      data: {
        donationKitId: kit.id,
        componentType: "BOX",
        quantity: 1,
        boxId: box.id,
        description: "Presentation box for the donor kit.",
      },
    });
  }

  const eventSeeds = [
    {
      eventName: "Spring Storytelling Fundraiser",
      description: "Main public campaign event for demo data.",
      type: "FUNDRAISER",
      startDate: new Date("2026-04-12"),
      endDate: new Date("2026-04-12"),
      country: "China",
      city: "Shanghai",
      employeeId: admin.id,
      isActive: true,
    },
    {
      eventName: "Community Care Reading Day",
      description: "A community reading and donor engagement event focused on elder companionship.",
      type: "COMMUNITY_OUTREACH",
      startDate: new Date("2026-04-18"),
      endDate: new Date("2026-04-18"),
      country: "China",
      city: "Suzhou",
      employeeId: extraEmployees[0]?.id || operationsEmployee.id,
      isActive: true,
    },
    {
      eventName: "Family Story Night",
      description: "An evening donor event centered on intergenerational storytelling and campaign updates.",
      type: "BOOK_LAUNCH",
      startDate: new Date("2026-04-26"),
      endDate: new Date("2026-04-26"),
      country: "China",
      city: "Hangzhou",
      employeeId: operationsEmployee.id,
      isActive: true,
    },
  ];

  const seededEvents = [];
  for (const eventSeed of eventSeeds) {
    const existingEvent = await prisma.event.findFirst({
      where: {
        eventName: eventSeed.eventName,
        startDate: eventSeed.startDate,
      },
    });

    const seededEvent = existingEvent
      ? await prisma.event.update({
          where: { id: existingEvent.id },
          data: eventSeed,
        })
      : await prisma.event.create({
          data: eventSeed,
        });

    seededEvents.push(seededEvent);
  }

  const [event, communityEvent, familyEvent] = seededEvents;

  await prisma.donor.update({
    where: { id: donor.id },
    data: {
      sourceEventId: event.id,
    },
  });

  await prisma.promotionAsset.upsert({
    where: { assetCode: "AST-DEMO-001" },
    update: {},
    create: {
      assetCode: "AST-DEMO-001",
      assetCategory: "PRINT",
      assetName: "Campaign Flyer",
      description: "One-page campaign handout.",
      assetType: "FLYER",
      isActive: true,
    },
  });

  const promotionInventory = await prisma.promotionInventory.upsert({
    where: { inventoryCode: "PINV-DEMO-001" },
    update: {},
    create: {
      inventoryCode: "PINV-DEMO-001",
      promotionInventoryType: "Bookmark",
      size: "Standard",
      unitCost: 0.8,
      currentStock: 350,
      reorderLevel: 120,
      description: "Bookmark handout inventory.",
      lastRestockDate: new Date("2026-03-20"),
      isActive: true,
    },
  });

  const existingAssignment = await prisma.promotionGiftAssignment.findFirst({
    where: {
      eventId: event.id,
      promotionInventoryId: promotionInventory.id,
      giftDate: new Date("2026-04-12"),
    },
  });

  if (!existingAssignment) {
    await prisma.promotionGiftAssignment.create({
      data: {
        eventId: event.id,
        promotionInventoryId: promotionInventory.id,
        giftQuantity: 60,
        giftDate: new Date("2026-04-12"),
        status: "ASSIGNED",
      },
    });
  }

  const scheduleSeeds = [
    {
      employeeId: operationsEmployee.id,
      eventId: event.id,
      shiftDate: new Date("2026-04-12"),
      startTime: "09:00",
      endTime: "13:00",
      status: "SCHEDULED",
      notes: "Front-of-house donor welcome and check-in coverage.",
    },
    {
      employeeId: operationsEmployee.id,
      eventId: null,
      shiftDate: new Date("2026-04-05"),
      startTime: "13:30",
      endTime: "17:30",
      status: "SCHEDULED",
      notes: "Inventory prep and donor kit assembly block.",
    },
    {
      employeeId: operationsEmployee.id,
      eventId: null,
      shiftDate: new Date("2026-03-30"),
      startTime: "10:00",
      endTime: "14:00",
      status: "COMPLETED",
      notes: "Completed postcard packing and outbound coordination.",
    },
    {
      employeeId: admin.id,
      eventId: communityEvent.id,
      shiftDate: new Date("2026-04-18"),
      startTime: "08:30",
      endTime: "12:30",
      status: "SCHEDULED",
      notes: "Campaign oversight and partner coordination for community reading day.",
    },
  ];

  for (const scheduleSeed of scheduleSeeds) {
    const existingSchedule = await prisma.schedule.findFirst({
      where: {
        employeeId: scheduleSeed.employeeId,
        shiftDate: scheduleSeed.shiftDate,
        startTime: scheduleSeed.startTime,
      },
    });

    if (!existingSchedule) {
      await prisma.schedule.create({
        data: scheduleSeed,
      });
    }
  }

  const vendor = await prisma.vendor.upsert({
    where: { vendorCode: "VEN-DEMO-001" },
    update: {},
    create: {
      vendorCode: "VEN-DEMO-001",
      name: "Sunrise Print Supply",
      contactPerson: "Eric Zhou",
      phoneNumber: "+86-13800002222",
      address: "Shanghai",
      email: "sales@sunriseprint.cn",
      rating: 5,
      supplyType: "Printing",
      lastSupplyDate: new Date("2026-03-18"),
      isActive: true,
    },
  });

  const invoice = await prisma.invoice.upsert({
    where: { invoiceNumber: "INV-DEMO-001" },
    update: {},
    create: {
      invoiceNumber: "INV-DEMO-001",
      employeeId: admin.id,
      invoiceDate: new Date("2026-03-20"),
      dueDate: new Date("2026-04-20"),
      vendorId: vendor.id,
      status: "APPROVED",
      notes: "Demo seeded invoice.",
      subtotal: 720,
      taxAmount: 43.2,
      totalAmount: 763.2,
    },
  });

  const payable = await prisma.payable.upsert({
    where: { invoiceId: invoice.id },
    update: {},
    create: {
      invoiceId: invoice.id,
      remainingAmount: 263.2,
      dueDate: new Date("2026-04-20"),
      paymentTerms: "Net 30",
      notes: "Demo seeded payable.",
      status: "PARTIALLY_PAID",
    },
  });

  const existingPayment = await prisma.invoicePayment.findFirst({
    where: {
      payableId: payable.id,
      referenceNumber: "PAY-DEMO-001",
    },
  });

  if (!existingPayment) {
    await prisma.invoicePayment.create({
      data: {
        payableId: payable.id,
        amount: 500,
        paymentDate: new Date("2026-03-28"),
        paymentMethod: "BANK_TRANSFER",
        referenceNumber: "PAY-DEMO-001",
        notes: "Demo partial payment.",
      },
    });
  }

  await prisma.donationReceivable.upsert({
    where: { donationCode: "DR-DEMO-001" },
    update: {
      donationFrequency: "MONTHLY",
      eventId: event.id,
    },
    create: {
      donationCode: "DR-DEMO-001",
      donorId: donor.id,
      donationAmount: 150,
      donationDate: new Date("2026-04-01"),
      donationFrequency: "MONTHLY",
      status: "PENDING",
      eventId: event.id,
      donationKitId: kit.id,
      employeeId: admin.id,
      notes: "Demo donation record.",
    },
  });

  const donation = await prisma.donationReceivable.findUnique({
    where: { donationCode: "DR-DEMO-001" },
  });

  await prisma.donationReceipt.upsert({
    where: { receiptNumber: "RCPT-DEMO-001" },
    update: {},
    create: {
      receiptNumber: "RCPT-DEMO-001",
      donationId: donation.id,
      amount: 150,
      receiptDate: new Date("2026-04-02"),
      paymentMethod: "BANK_TRANSFER",
      transactionId: "TXN-DEMO-001",
      status: "ISSUED",
      notes: "Demo receipt for seeded donation.",
    },
  });

  await prisma.shipping.upsert({
    where: { trackingNumber: "TRACK-DEMO-001" },
    update: {},
    create: {
      donationId: donation.id,
      trackingNumber: "TRACK-DEMO-001",
      carrier: "SF Express",
      shippedDate: new Date("2026-04-03"),
      deliveryDate: new Date("2026-04-05"),
      shippingCost: 16,
      status: "DELIVERED",
    },
  });

  const existingFeedback = await prisma.feedback.findFirst({
    where: {
      donationId: donation.id,
      feedbackContent: "The storybook package felt thoughtful and presentation-ready.",
    },
  });

  if (!existingFeedback) {
    await prisma.feedback.create({
      data: {
        donationId: donation.id,
        feedbackContent: "The storybook package felt thoughtful and presentation-ready.",
        rating: 5,
        feedbackDate: new Date("2026-04-06"),
        responseContent: "Thank you for supporting the demo campaign.",
        responseDate: new Date("2026-04-07"),
        status: "RESPONDED",
      },
    });
  }

  const donorSeeds = [
    { donorCode: "DON-DEMO-002", firstName: "Lina", lastName: "Zhou", birthday: "1991-03-12", gender: "FEMALE", maritalStatus: "MARRIED", email: "lina.zhou@example.org", city: "Shanghai", preferredLanguage: "zh-CN", donationAmount: 180, donationFrequency: "ONE_TIME", donationStatus: "CONFIRMED", sourceEventId: event.id },
    { donorCode: "DON-DEMO-003", firstName: "Michael", lastName: "Tan", birthday: "1988-07-24", gender: "MALE", maritalStatus: "MARRIED", email: "michael.tan@example.org", city: "Suzhou", preferredLanguage: "en", donationAmount: 240, donationFrequency: "MONTHLY", donationStatus: "PENDING", sourceEventId: communityEvent.id },
    { donorCode: "DON-DEMO-004", firstName: "Ivy", lastName: "Chen", birthday: "1996-11-08", gender: "FEMALE", maritalStatus: "SINGLE", email: "ivy.chen@example.org", city: "Hangzhou", preferredLanguage: "zh-CN", donationAmount: 95, donationFrequency: "ONE_TIME", donationStatus: "COMPLETED", sourceEventId: familyEvent.id },
    { donorCode: "DON-DEMO-005", firstName: "Noah", lastName: "Wu", birthday: "1985-01-17", gender: "MALE", maritalStatus: "MARRIED", email: "noah.wu@example.org", city: "Nanjing", preferredLanguage: "en", donationAmount: 320, donationFrequency: "ONE_TIME", donationStatus: "SHIPPED", sourceEventId: event.id },
    { donorCode: "DON-DEMO-006", firstName: "Rachel", lastName: "Lin", birthday: "1993-09-05", gender: "FEMALE", maritalStatus: "SINGLE", email: "rachel.lin@example.org", city: "Shanghai", preferredLanguage: "zh-CN", donationAmount: 210, donationFrequency: "MONTHLY", donationStatus: "CONFIRMED", sourceEventId: communityEvent.id },
    { donorCode: "DON-DEMO-007", firstName: "Owen", lastName: "Liu", birthday: "1990-04-20", gender: "MALE", maritalStatus: "PREFER_NOT_TO_SAY", email: "owen.liu@example.org", city: "Beijing", preferredLanguage: "en", donationAmount: 150, donationFrequency: "ONE_TIME", donationStatus: "PENDING", sourceEventId: familyEvent.id },
    { donorCode: "DON-DEMO-008", firstName: "Ella", lastName: "Sun", birthday: "1997-02-14", gender: "FEMALE", maritalStatus: "SINGLE", email: "ella.sun@example.org", city: "Shenzhen", preferredLanguage: "zh-CN", donationAmount: 275, donationFrequency: "MONTHLY", donationStatus: "RECEIPTED", sourceEventId: event.id },
    { donorCode: "DON-DEMO-009", firstName: "Daniel", lastName: "He", birthday: "1989-12-02", gender: "MALE", maritalStatus: "MARRIED", email: "daniel.he@example.org", city: "Chengdu", preferredLanguage: "en", donationAmount: 130, donationFrequency: "ONE_TIME", donationStatus: "CONFIRMED", sourceEventId: communityEvent.id },
    { donorCode: "DON-DEMO-010", firstName: "Grace", lastName: "Feng", birthday: "1994-08-29", gender: "FEMALE", maritalStatus: "SINGLE", email: "grace.feng@example.org", city: "Wuxi", preferredLanguage: "zh-CN", donationAmount: 400, donationFrequency: "ONE_TIME", donationStatus: "SHIPPED", sourceEventId: familyEvent.id },
    { donorCode: "DON-DEMO-011", firstName: "Ethan", lastName: "Shen", birthday: "1987-05-16", gender: "MALE", maritalStatus: "MARRIED", email: "ethan.shen@example.org", city: "Ningbo", preferredLanguage: "en", donationAmount: 165, donationFrequency: "MONTHLY", donationStatus: "COMPLETED", sourceEventId: event.id },
  ];

  for (const donorSeed of donorSeeds) {
    const {
      donorCode,
      firstName,
      lastName,
      birthday,
      gender,
      maritalStatus,
      email,
      city,
      preferredLanguage,
      donationAmount,
      donationFrequency,
      donationStatus,
      sourceEventId,
    } = donorSeed;
    const seededDonor = await prisma.donor.upsert({
      where: { donorCode },
      update: {
        firstName,
        lastName,
        birthday: new Date(birthday),
        gender,
        maritalStatus,
        email,
        city,
        country: "China",
        preferredLanguage,
        accountStatus: "ACTIVE",
        supporterType: "DONOR",
        sourceEventId,
      },
      create: {
        donorCode,
        firstName,
        lastName,
        birthday: new Date(birthday),
        gender,
        maritalStatus,
        email,
        city,
        country: "China",
        preferredLanguage,
        accountStatus: "ACTIVE",
        supporterType: "DONOR",
        sourceEventId,
        registrationDate: new Date("2026-04-01"),
      },
    });

    const donationCode = donorCode.replace("DON", "DR");
    const receiptCode = donorCode.replace("DON", "RCPT");
    const shippingCode = donorCode.replace("DON", "TRACK");

    await prisma.donationReceivable.upsert({
      where: { donationCode },
      update: {
        donorId: seededDonor.id,
        donationAmount,
        donationDate: new Date("2026-04-01"),
        donationFrequency,
        status: donationStatus,
        donationKitId: kit.id,
        employeeId: operationsEmployee.id,
        eventId: sourceEventId,
      },
      create: {
        donationCode,
        donorId: seededDonor.id,
        donationAmount,
        donationDate: new Date("2026-04-01"),
        donationFrequency,
        status: donationStatus,
        donationKitId: kit.id,
        employeeId: operationsEmployee.id,
        eventId: sourceEventId,
        notes: `${firstName} ${lastName} seeded donation.`,
      },
    });

    const seededDonation = await prisma.donationReceivable.findUnique({
      where: { donationCode },
    });

    if (["CONFIRMED", "RECEIPTED", "SHIPPED", "COMPLETED"].includes(donationStatus)) {
      await prisma.donationReceipt.upsert({
        where: { receiptNumber: receiptCode },
        update: {
          donationId: seededDonation.id,
          amount: donationAmount,
        },
        create: {
          receiptNumber: receiptCode,
          donationId: seededDonation.id,
          amount: donationAmount,
          receiptDate: new Date("2026-04-02"),
          paymentMethod: donationFrequency === "MONTHLY" ? "CARD" : "BANK_TRANSFER",
          transactionId: `${receiptCode}-TXN`,
          status: "ISSUED",
          notes: "Auto-seeded receipt record.",
        },
      });
    }

    if (["SHIPPED", "COMPLETED"].includes(donationStatus)) {
      await prisma.shipping.upsert({
        where: { trackingNumber: shippingCode },
        update: {
          donationId: seededDonation.id,
          status: donationStatus === "COMPLETED" ? "DELIVERED" : "SHIPPED",
        },
        create: {
          donationId: seededDonation.id,
          trackingNumber: shippingCode,
          carrier: "SF Express",
          shippedDate: new Date("2026-04-03"),
          deliveryDate: donationStatus === "COMPLETED" ? new Date("2026-04-06") : null,
          shippingCost: 18,
          status: donationStatus === "COMPLETED" ? "DELIVERED" : "SHIPPED",
        },
      });
    }

    const existingSeedFeedback = await prisma.feedback.findFirst({
      where: {
        donationId: seededDonation.id,
      },
    });

    if (!existingSeedFeedback && ["CONFIRMED", "SHIPPED", "COMPLETED"].includes(donationStatus)) {
      await prisma.feedback.create({
        data: {
          donationId: seededDonation.id,
          feedbackContent: `Seeded supporter note from ${firstName} ${lastName}.`,
          rating: donationStatus === "COMPLETED" ? 5 : 4,
          feedbackDate: new Date("2026-04-07"),
          status: donationStatus === "COMPLETED" ? "RESPONDED" : "REVIEWED",
          responseContent:
            donationStatus === "COMPLETED" ? "Thank you for supporting elder care through story." : null,
          responseDate: donationStatus === "COMPLETED" ? new Date("2026-04-08") : null,
        },
      });
    }
  }

  const vendorSeeds = [
    {
      vendorCode: "VEN-DEMO-002",
      name: "Harbor Packaging Studio",
      contactPerson: "Tina Luo",
      phoneNumber: "+86-13800003333",
      address: "Shanghai",
      email: "orders@harborpack.cn",
      supplyType: "Packaging",
      rating: 4,
    },
    {
      vendorCode: "VEN-DEMO-003",
      name: "Blue Shore Print Lab",
      contactPerson: "Kevin Fang",
      phoneNumber: "+86-13800004444",
      address: "Suzhou",
      email: "hello@blueshoreprint.cn",
      supplyType: "Printing",
      rating: 5,
    },
  ];

  const seededVendors = [];
  for (const vendorSeed of vendorSeeds) {
    const seededVendor = await prisma.vendor.upsert({
      where: { vendorCode: vendorSeed.vendorCode },
      update: vendorSeed,
      create: {
        ...vendorSeed,
        lastSupplyDate: new Date("2026-03-22"),
        isActive: true,
      },
    });
    seededVendors.push(seededVendor);
  }

  const invoiceSeeds = [
    {
      invoiceNumber: "INV-DEMO-002",
      vendorId: vendor.id,
      employeeId: admin.id,
      invoiceDate: new Date("2026-03-22"),
      dueDate: new Date("2026-04-22"),
      status: "APPROVED",
      notes: "Envelope replenishment batch.",
      subtotal: 240,
      taxAmount: 14.4,
      totalAmount: 254.4,
      payableStatus: "OPEN",
      remainingAmount: 254.4,
      items: [
        {
          envelopeId: envelope.id,
          description: "A5 donor envelope restock",
          quantity: 200,
          unitPrice: 1.2,
          amount: 240,
        },
      ],
    },
    {
      invoiceNumber: "INV-DEMO-003",
      vendorId: seededVendors[0].id,
      employeeId: operationsEmployee.id,
      invoiceDate: new Date("2026-03-24"),
      dueDate: new Date("2026-04-24"),
      status: "PARTIALLY_PAID",
      notes: "Presentation box and assembly support.",
      subtotal: 1035,
      taxAmount: 62.1,
      totalAmount: 1097.1,
      payableStatus: "PARTIALLY_PAID",
      remainingAmount: 497.1,
      payment: { amount: 600, paymentDate: new Date("2026-03-30"), referenceNumber: "PAY-DEMO-002" },
      items: [
        {
          boxId: box.id,
          description: "Presentation gift box restock",
          quantity: 180,
          unitPrice: 4.5,
          amount: 810,
        },
        {
          promotionInventoryId: promotionInventory.id,
          description: "Bookmark print replenishment",
          quantity: 281,
          unitPrice: 0.8,
          amount: 225,
        },
      ],
    },
    {
      invoiceNumber: "INV-DEMO-004",
      vendorId: seededVendors[1].id,
      employeeId: admin.id,
      invoiceDate: new Date("2026-03-27"),
      dueDate: new Date("2026-04-27"),
      status: "APPROVED",
      notes: "Spring event print package.",
      subtotal: 960,
      taxAmount: 57.6,
      totalAmount: 1017.6,
      payableStatus: "OPEN",
      remainingAmount: 1017.6,
      items: [
        {
          promotionInventoryId: promotionInventory.id,
          description: "Flyer and bookmark combo print run",
          quantity: 1200,
          unitPrice: 0.8,
          amount: 960,
        },
      ],
    },
  ];

  for (const invoiceSeed of invoiceSeeds) {
    const seededInvoice = await prisma.invoice.upsert({
      where: { invoiceNumber: invoiceSeed.invoiceNumber },
      update: {
        employeeId: invoiceSeed.employeeId,
        invoiceDate: invoiceSeed.invoiceDate,
        dueDate: invoiceSeed.dueDate,
        vendorId: invoiceSeed.vendorId,
        status: invoiceSeed.status,
        notes: invoiceSeed.notes,
        subtotal: invoiceSeed.subtotal,
        taxAmount: invoiceSeed.taxAmount,
        totalAmount: invoiceSeed.totalAmount,
      },
      create: {
        invoiceNumber: invoiceSeed.invoiceNumber,
        employeeId: invoiceSeed.employeeId,
        invoiceDate: invoiceSeed.invoiceDate,
        dueDate: invoiceSeed.dueDate,
        vendorId: invoiceSeed.vendorId,
        status: invoiceSeed.status,
        notes: invoiceSeed.notes,
        subtotal: invoiceSeed.subtotal,
        taxAmount: invoiceSeed.taxAmount,
        totalAmount: invoiceSeed.totalAmount,
      },
    });

    await prisma.payable.upsert({
      where: { invoiceId: seededInvoice.id },
      update: {
        remainingAmount: invoiceSeed.remainingAmount,
        dueDate: invoiceSeed.dueDate,
        paymentTerms: "Net 30",
        notes: invoiceSeed.notes,
        status: invoiceSeed.payableStatus,
      },
      create: {
        invoiceId: seededInvoice.id,
        remainingAmount: invoiceSeed.remainingAmount,
        dueDate: invoiceSeed.dueDate,
        paymentTerms: "Net 30",
        notes: invoiceSeed.notes,
        status: invoiceSeed.payableStatus,
      },
    });

    await prisma.invoiceItem.deleteMany({
      where: { invoiceId: seededInvoice.id },
    });

    for (const line of invoiceSeed.items) {
      await prisma.invoiceItem.create({
        data: {
          invoiceId: seededInvoice.id,
          envelopeId: line.envelopeId,
          boxId: line.boxId,
          promotionInventoryId: line.promotionInventoryId,
          description: line.description,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          amount: line.amount,
        },
      });
    }

    if (invoiceSeed.payment) {
      const seededPayable = await prisma.payable.findUnique({
        where: { invoiceId: seededInvoice.id },
      });

      const existingPaymentRecord = await prisma.invoicePayment.findFirst({
        where: {
          payableId: seededPayable.id,
          referenceNumber: invoiceSeed.payment.referenceNumber,
        },
      });

      if (!existingPaymentRecord) {
        await prisma.invoicePayment.create({
          data: {
            payableId: seededPayable.id,
            amount: invoiceSeed.payment.amount,
            paymentDate: invoiceSeed.payment.paymentDate,
            paymentMethod: "BANK_TRANSFER",
            referenceNumber: invoiceSeed.payment.referenceNumber,
            notes: "Seeded partial payment record.",
          },
        });
      }
    }
  }

  console.log("Seed complete.");
  console.log("Admin login: admin@example.org / admin123");
  console.log("Employee login: operations@example.org / employee123");
  console.log("Donor login: demo.donor@example.org / donor123");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
