import { calculateAge, formatCurrency, formatDate } from "../utils/format";

const donorRows = [];
const donationRows = [];

function humanizeEnum(value) {
  return String(value || "")
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

const staticModuleRows = {
  receipts: [
    {
      id: 1,
      code: "RCPT-2026-001",
      donor: "Mei Zhang",
      amount: 200,
      paymentMethod: "Bank transfer",
      receiptDate: "2026-03-28",
      status: "Issued",
      notes: "Bank transfer confirmed and matched.",
    },
    {
      id: 2,
      code: "RCPT-2026-002",
      donor: "Jason Wang",
      amount: 500,
      paymentMethod: "Card",
      receiptDate: "2026-03-29",
      status: "Issued",
      notes: "Processed on-site during fundraiser.",
    },
  ],
  shipping: [
    {
      id: 1,
      code: "SHIP-001",
      donor: "Mei Zhang",
      carrier: "SF Express",
      trackingNumber: "SF123456789CN",
      shippedDate: "2026-03-29",
      deliveryDate: "2026-03-31",
      status: "Delivered",
      shippingCost: 18,
    },
    {
      id: 2,
      code: "SHIP-002",
      donor: "Jason Wang",
      carrier: "YTO",
      trackingNumber: "YTO987654321CN",
      shippedDate: "2026-03-31",
      deliveryDate: null,
      status: "Shipped",
      shippingCost: 22,
    },
  ],
  feedback: [
    {
      id: 1,
      code: "FDBK-001",
      donor: "Mei Zhang",
      rating: 5,
      feedbackDate: "2026-04-01",
      status: "Responded",
      comment: "The gift kit arrived beautifully packaged and the book is lovely.",
    },
    {
      id: 2,
      code: "FDBK-002",
      donor: "Sara Liu",
      rating: 4,
      feedbackDate: "2026-04-02",
      status: "Reviewed",
      comment: "Great concept, and the thank-you experience felt personal.",
    },
  ],
  "donation-kits": [
    {
      id: 1,
      code: "KIT-STARTER",
      name: "Starter Story Kit",
      components: 3,
      active: "Active",
      estimatedCost: 23.7,
      description: "One book, one envelope, one presentation box.",
    },
    {
      id: 2,
      code: "KIT-FAMILY",
      name: "Family Story Kit",
      components: 2,
      active: "Active",
      estimatedCost: 40.5,
      description: "Two books with upgraded packaging for larger donors.",
    },
  ],
  books: [
    {
      id: 1,
      code: "BOOK-001",
      title: "Chaofeng and Maui in Making Friends",
      format: "Hardcover",
      stock: 240,
      reorderLevel: 50,
      status: "In stock",
      unitCost: 18,
    },
    {
      id: 2,
      code: "BOOK-002",
      title: "Chaofeng and Maui in Making Friends (PDF)",
      format: "PDF",
      stock: 999,
      reorderLevel: 0,
      status: "Available",
      unitCost: 6,
    },
  ],
  envelopes: [
    {
      id: 1,
      code: "ENV-A5-WHT",
      size: "A5",
      stock: 500,
      reorderLevel: 100,
      unitCost: 1.2,
      status: "Healthy",
    },
    {
      id: 2,
      code: "ENV-A4-CRM",
      size: "A4",
      stock: 80,
      reorderLevel: 120,
      unitCost: 1.5,
      status: "Low stock",
    },
  ],
  boxes: [
    {
      id: 1,
      code: "BOX-S-GOLD",
      size: "Small",
      stock: 180,
      reorderLevel: 40,
      unitCost: 4.5,
      status: "Healthy",
    },
    {
      id: 2,
      code: "BOX-M-KRAFT",
      size: "Medium",
      stock: 22,
      reorderLevel: 30,
      unitCost: 5.2,
      status: "Low stock",
    },
  ],
  "promotion-inventory": [
    {
      id: 1,
      code: "PINV-FLYER-A4",
      type: "Flyer",
      size: "A4",
      stock: 1200,
      reorderLevel: 200,
      unitCost: 0.6,
      status: "Healthy",
    },
    {
      id: 2,
      code: "PINV-BMK-STD",
      type: "Bookmark",
      size: "Standard",
      stock: 80,
      reorderLevel: 150,
      unitCost: 0.8,
      status: "Low stock",
    },
  ],
  events: [
    {
      id: 1,
      code: "EVT-001",
      name: "Spring Storytelling Fundraiser",
      type: "Fundraiser",
      startDate: "2026-04-12",
      city: "Shanghai",
      owner: "Amy Wu",
      status: "Active",
    },
    {
      id: 2,
      code: "EVT-002",
      name: "School Reading Outreach",
      type: "School visit",
      startDate: "2026-04-25",
      city: "Suzhou",
      owner: "Amy Wu",
      status: "Active",
    },
  ],
  "promotion-assets": [
    {
      id: 1,
      code: "AST-FLYER-001",
      name: "Campaign Flyer",
      category: "Print",
      assetType: "Flyer",
      status: "Active",
      description: "One-page campaign introduction flyer.",
    },
    {
      id: 2,
      code: "AST-BMK-001",
      name: "Story Bookmark",
      category: "Merchandise",
      assetType: "Bookmark",
      status: "Active",
      description: "Bookmark given at events and in gift packs.",
    },
  ],
  vendors: [
    {
      id: 1,
      code: "VEN-PRINT-001",
      name: "Sunrise Print Supply",
      contactPerson: "Eric Zhou",
      supplyType: "Printing",
      rating: 5,
      status: "Active",
      email: "sales@sunriseprint.cn",
    },
    {
      id: 2,
      code: "VEN-PACK-001",
      name: "Golden Pack Co.",
      contactPerson: "Nina Xu",
      supplyType: "Packaging",
      rating: 4,
      status: "Active",
      email: "hello@goldenpack.cn",
    },
  ],
  invoices: [
    {
      id: 1,
      code: "INV-2026-001",
      vendor: "Sunrise Print Supply",
      invoiceDate: "2026-03-20",
      dueDate: "2026-04-20",
      total: 763.2,
      status: "Approved",
    },
    {
      id: 2,
      code: "INV-2026-002",
      vendor: "Golden Pack Co.",
      invoiceDate: "2026-03-18",
      dueDate: "2026-04-18",
      total: 858.6,
      status: "Partially paid",
    },
  ],
  payables: [
    {
      id: 1,
      code: "PAYABLE-001",
      invoice: "INV-2026-001",
      dueDate: "2026-04-20",
      remainingAmount: 763.2,
      paymentTerms: "Net 30",
      status: "Open",
    },
    {
      id: 2,
      code: "PAYABLE-002",
      invoice: "INV-2026-002",
      dueDate: "2026-04-18",
      remainingAmount: 358.6,
      paymentTerms: "Net 30",
      status: "Partially paid",
    },
  ],
  payments: [
    {
      id: 1,
      code: "PAY-2026-001",
      payable: "PAYABLE-002",
      amount: 500,
      paymentDate: "2026-03-28",
      paymentMethod: "Bank transfer",
      status: "Posted",
    },
    {
      id: 2,
      code: "PAY-2026-002",
      payable: "PAYABLE-001",
      amount: 763.2,
      paymentDate: "2026-04-10",
      paymentMethod: "Bank transfer",
      status: "Scheduled",
    },
  ],
};

function liveDonorLoader({ items }) {
  return items.map((item) => ({
    id: item.id,
    code: item.donorCode,
    name: `${item.firstName} ${item.lastName}`,
    birthday: item.birthday,
    age: calculateAge(item.birthday),
    gender: humanizeEnum(item.gender || "PREFER_NOT_TO_SAY"),
    maritalStatus: humanizeEnum(item.maritalStatus || "PREFER_NOT_TO_SAY"),
    email: item.email || "No email",
    location: [item.city, item.country].filter(Boolean).join(", "),
    language: item.preferredLanguage || "Unknown",
    supporterType: humanizeEnum(item.supporterType || "SUPPORTER"),
    status: humanizeEnum(item.accountStatus || "INACTIVE"),
    detail: {
      "Donor Code": item.donorCode,
      Name: `${item.firstName} ${item.lastName}`,
      Birthday: formatDate(item.birthday),
      Age: calculateAge(item.birthday),
      Gender: humanizeEnum(item.gender || "PREFER_NOT_TO_SAY"),
      "Marital Status": humanizeEnum(item.maritalStatus || "PREFER_NOT_TO_SAY"),
      Email: item.email || "No email",
      Phone: item.phone || "No phone",
      Country: item.country,
      State: item.state || "-",
      City: item.city || "-",
      "Postal Code": item.postalCode || "-",
      Language: item.preferredLanguage || "-",
      "Supporter Type": humanizeEnum(item.supporterType || "SUPPORTER"),
      "Account Status": humanizeEnum(item.accountStatus || "INACTIVE"),
      "Source Event": item.sourceEvent?.eventName || "-",
      Registered: formatDate(item.registrationDate),
    },
  }));
}

function liveEmployeeLoader({ items }) {
  return items.map((item) => ({
    id: item.id,
    code: item.employeeCode,
    name: item.name,
    username: item.email || "No login email",
    gender: humanizeEnum(item.gender || "PREFER_NOT_TO_SAY"),
    maritalStatus: humanizeEnum(item.maritalStatus || "PREFER_NOT_TO_SAY"),
    role: humanizeEnum(item.role),
    position: item.position || "-",
    status: humanizeEnum(item.status),
    detail: {
      "Employee Code": item.employeeCode,
      Name: item.name,
      Username: item.email || "-",
      Gender: humanizeEnum(item.gender || "PREFER_NOT_TO_SAY"),
      "Marital Status": humanizeEnum(item.maritalStatus || "PREFER_NOT_TO_SAY"),
      Role: humanizeEnum(item.role),
      Status: humanizeEnum(item.status),
      Position: item.position || "-",
      Contact: item.contact || "-",
      Schedule: item.schedule || "-",
      Hometown: item.hometown || "-",
      Birthday: formatDate(item.birthday),
      "Password Status": item.passwordConfigured ? "Set" : "Not set",
      "Assigned Schedules": item._count?.schedules ?? 0,
      "Assigned Donations": item._count?.donations ?? 0,
      "Assigned Events": item._count?.events ?? 0,
      "Assigned Invoices": item._count?.invoices ?? 0,
      Created: formatDate(item.createdAt),
    },
    raw: {
      employeeCode: item.employeeCode,
      name: item.name,
      email: item.email || "",
      gender: item.gender || "",
      maritalStatus: item.maritalStatus || "",
      birthday: item.birthday ? new Date(item.birthday).toISOString().slice(0, 10) : "",
      contact: item.contact || "",
      schedule: item.schedule || "",
      hometown: item.hometown || "",
      position: item.position || "",
      role: item.role,
      status: item.status,
      password: "",
    },
  }));
}

function liveScheduleLoader({ items }) {
  return items.map((item) => ({
    id: item.id,
    code: `SCH-${String(item.id).padStart(4, "0")}`,
    employee: item.employee?.name || "Unknown employee",
    event: item.event?.eventName || "General shift",
    shiftDate: item.shiftDate,
    shiftWindow: `${item.startTime} - ${item.endTime}`,
    status: humanizeEnum(item.status),
    detail: {
      "Schedule ID": `SCH-${String(item.id).padStart(4, "0")}`,
      Employee: item.employee?.name || "Unknown employee",
      Event: item.event?.eventName || "General shift",
      "Shift Date": formatDate(item.shiftDate),
      "Start Time": item.startTime,
      "End Time": item.endTime,
      Status: humanizeEnum(item.status),
      Notes: item.notes || "-",
    },
    raw: {
      employeeId: item.employeeId,
      eventId: item.eventId ?? "",
      shiftDate: item.shiftDate ? new Date(item.shiftDate).toISOString().slice(0, 10) : "",
      startTime: item.startTime || "",
      endTime: item.endTime || "",
      status: item.status,
      notes: item.notes || "",
    },
  }));
}

function liveDonationLoader({ items }) {
  return items.map((item) => ({
    id: item.id,
    code: item.donationCode,
    donor: item.donor ? `${item.donor.firstName} ${item.donor.lastName}` : "Unknown donor",
    amount: formatCurrency(item.donationAmount),
    rawAmount: Number(item.donationAmount || 0),
    frequency: humanizeEnum(item.donationFrequency || "ONE_TIME"),
    event: item.event?.eventName || "Direct donation",
    kit: item.donationKit?.kitName || "No kit",
    owner: item.employee?.name || "Unassigned",
    status: item.status,
    donationDate: formatDate(item.donationDate),
    detail: {
      "Donation Code": item.donationCode,
      Donor: item.donor ? `${item.donor.firstName} ${item.donor.lastName}` : "Unknown donor",
      Amount: formatCurrency(item.donationAmount),
      Frequency: humanizeEnum(item.donationFrequency || "ONE_TIME"),
      Status: item.status,
      Event: item.event?.eventName || "Direct donation",
      "Donation Kit": item.donationKit?.kitName || "-",
      Owner: item.employee?.name || "-",
      Date: formatDate(item.donationDate),
      Notes: item.notes || "-",
    },
  }));
}

function liveReceiptLoader({ items }) {
  return items.map((item) => ({
    id: item.id,
    code: item.receiptNumber,
    donor: item.donation?.donor ? `${item.donation.donor.firstName} ${item.donation.donor.lastName}` : "Unknown donor",
    amount: Number(item.amount || 0),
    paymentMethod: humanizeEnum(item.paymentMethod),
    receiptDate: item.receiptDate,
    status: humanizeEnum(item.status),
    detail: {
      "Receipt Number": item.receiptNumber,
      "Donation Code": item.donation?.donationCode || "-",
      Donor: item.donation?.donor ? `${item.donation.donor.firstName} ${item.donation.donor.lastName}` : "Unknown donor",
      Amount: formatCurrency(item.amount),
      "Receipt Date": formatDate(item.receiptDate),
      "Payment Method": humanizeEnum(item.paymentMethod),
      "Transaction ID": item.transactionId || "-",
      Status: humanizeEnum(item.status),
      Notes: item.notes || "-",
    },
    raw: {
      receiptNumber: item.receiptNumber,
      donationId: item.donationId,
      amount: Number(item.amount || 0),
      receiptDate: item.receiptDate ? new Date(item.receiptDate).toISOString().slice(0, 10) : "",
      paymentMethod: item.paymentMethod,
      transactionId: item.transactionId || "",
      status: item.status,
      notes: item.notes || "",
    },
  }));
}

function liveShippingLoader({ items }) {
  return items.map((item) => ({
    id: item.id,
    code: item.trackingNumber || `SHIP-${item.id}`,
    donor: item.donation?.donor ? `${item.donation.donor.firstName} ${item.donation.donor.lastName}` : "Unknown donor",
    carrier: item.carrier || "Unassigned",
    trackingNumber: item.trackingNumber || "-",
    shippedDate: item.shippedDate,
    status: humanizeEnum(item.status),
    detail: {
      "Donation Code": item.donation?.donationCode || "-",
      Donor: item.donation?.donor ? `${item.donation.donor.firstName} ${item.donation.donor.lastName}` : "Unknown donor",
      Carrier: item.carrier || "-",
      "Tracking Number": item.trackingNumber || "-",
      "Shipped Date": formatDate(item.shippedDate),
      "Delivery Date": formatDate(item.deliveryDate),
      "Shipping Cost": item.shippingCost != null ? formatCurrency(item.shippingCost) : "-",
      Status: humanizeEnum(item.status),
    },
    raw: {
      donationId: item.donationId,
      trackingNumber: item.trackingNumber || "",
      carrier: item.carrier || "",
      shippedDate: item.shippedDate ? new Date(item.shippedDate).toISOString().slice(0, 10) : "",
      deliveryDate: item.deliveryDate ? new Date(item.deliveryDate).toISOString().slice(0, 10) : "",
      shippingCost: item.shippingCost != null ? Number(item.shippingCost) : "",
      status: item.status,
    },
  }));
}

function liveFeedbackLoader({ items }) {
  return items.map((item) => ({
    id: item.id,
    code: `FDBK-${item.id}`,
    donor: item.donation?.donor ? `${item.donation.donor.firstName} ${item.donation.donor.lastName}` : "Unknown donor",
    rating: item.rating || "-",
    feedbackDate: item.feedbackDate,
    status: humanizeEnum(item.status),
    comment: item.feedbackContent,
    detail: {
      "Donation Code": item.donation?.donationCode || "-",
      Donor: item.donation?.donor ? `${item.donation.donor.firstName} ${item.donation.donor.lastName}` : "Unknown donor",
      Rating: item.rating || "-",
      "Feedback Date": formatDate(item.feedbackDate),
      Status: humanizeEnum(item.status),
      Feedback: item.feedbackContent,
      Response: item.responseContent || "-",
      "Response Date": formatDate(item.responseDate),
    },
    raw: {
      donationId: item.donationId,
      feedbackContent: item.feedbackContent,
      rating: item.rating ?? "",
      feedbackDate: item.feedbackDate ? new Date(item.feedbackDate).toISOString().slice(0, 10) : "",
      responseContent: item.responseContent || "",
      responseDate: item.responseDate ? new Date(item.responseDate).toISOString().slice(0, 10) : "",
      status: item.status,
    },
  }));
}

function calculateKitCost(components = []) {
  return components.reduce((total, component) => {
    const unitCost = Number(component.book?.unitCost || component.envelope?.unitCost || component.box?.unitCost || 0);
    return total + unitCost * Number(component.quantity || 0);
  }, 0);
}

function stockStatus(currentStock, reorderLevel, isActive = true) {
  if (!isActive) {
    return "Inactive";
  }

  return Number(currentStock || 0) <= Number(reorderLevel || 0) ? "Low stock" : "Healthy";
}

function liveDonationKitLoader({ items }) {
  return items.map((item) => ({
    id: item.id,
    code: item.kitCode,
    name: item.kitName,
    components: item.components?.length || 0,
    estimatedCost: calculateKitCost(item.components),
    active: item.isActive ? "Active" : "Inactive",
    detail: {
      "Kit Code": item.kitCode,
      "Kit Name": item.kitName,
      Components: item.components?.length || 0,
      "Estimated Cost": formatCurrency(calculateKitCost(item.components)),
      Status: item.isActive ? "Active" : "Inactive",
      Description: item.description || "-",
    },
    raw: {
      kitCode: item.kitCode,
      kitName: item.kitName,
      description: item.description || "",
      isActive: item.isActive,
    },
  }));
}

function liveBookLoader({ items }) {
  return items.map((item) => ({
    id: item.id,
    code: `BOOK-${item.id}`,
    title: item.title,
    format: [item.bookFormat?.formatType, item.bookFormat?.language].filter(Boolean).join(" / "),
    stock: item.currentStock,
    reorderLevel: item.reorderLevel,
    status: stockStatus(item.currentStock, item.reorderLevel),
    unitCost: Number(item.unitCost || 0),
    detail: {
      Title: item.title,
      Press: item.press?.pressName || "-",
      Series: item.bookSeries?.seriesName || "-",
      Format: item.bookFormat?.formatType || "-",
      Language: item.bookFormat?.language || "-",
      "Page Count": item.pageCount || "-",
      "Unit Cost": formatCurrency(item.unitCost),
      "Current Stock": item.currentStock,
      "Reorder Level": item.reorderLevel,
      "Publication Date": formatDate(item.publicationDate),
      Status: stockStatus(item.currentStock, item.reorderLevel),
      Description: item.description || "-",
    },
    raw: {
      pressId: item.pressId,
      bookSeriesId: item.bookSeriesId ?? "",
      title: item.title,
      bookFormatId: item.bookFormatId,
      description: item.description || "",
      pageCount: item.pageCount ?? "",
      unitCost: Number(item.unitCost || 0),
      currentStock: item.currentStock,
      reorderLevel: item.reorderLevel,
      publicationDate: item.publicationDate ? new Date(item.publicationDate).toISOString().slice(0, 10) : "",
    },
  }));
}

function liveEnvelopeLoader({ items }) {
  return items.map((item) => ({
    id: item.id,
    code: item.envelopeCode,
    size: item.size,
    stock: item.currentStock,
    reorderLevel: item.reorderLevel,
    unitCost: Number(item.unitCost || 0),
    status: stockStatus(item.currentStock, item.reorderLevel, item.isActive),
    detail: {
      "Envelope Code": item.envelopeCode,
      Size: item.size,
      "Current Stock": item.currentStock,
      "Reorder Level": item.reorderLevel,
      "Unit Cost": formatCurrency(item.unitCost),
      "Last Restock": formatDate(item.lastRestockDate),
      Status: stockStatus(item.currentStock, item.reorderLevel, item.isActive),
      Description: item.description || "-",
    },
    raw: {
      envelopeCode: item.envelopeCode,
      size: item.size,
      unitCost: Number(item.unitCost || 0),
      currentStock: item.currentStock,
      reorderLevel: item.reorderLevel,
      description: item.description || "",
      lastRestockDate: item.lastRestockDate ? new Date(item.lastRestockDate).toISOString().slice(0, 10) : "",
      isActive: item.isActive,
    },
  }));
}

function liveBoxLoader({ items }) {
  return items.map((item) => ({
    id: item.id,
    code: item.boxCode,
    size: item.size,
    stock: item.currentStock,
    reorderLevel: item.reorderLevel,
    unitCost: Number(item.unitCost || 0),
    status: stockStatus(item.currentStock, item.reorderLevel, item.isActive),
    detail: {
      "Box Code": item.boxCode,
      Size: item.size,
      "Current Stock": item.currentStock,
      "Reorder Level": item.reorderLevel,
      "Unit Cost": formatCurrency(item.unitCost),
      "Last Restock": formatDate(item.lastRestockDate),
      Status: stockStatus(item.currentStock, item.reorderLevel, item.isActive),
      Description: item.description || "-",
    },
    raw: {
      boxCode: item.boxCode,
      size: item.size,
      unitCost: Number(item.unitCost || 0),
      currentStock: item.currentStock,
      reorderLevel: item.reorderLevel,
      description: item.description || "",
      lastRestockDate: item.lastRestockDate ? new Date(item.lastRestockDate).toISOString().slice(0, 10) : "",
      isActive: item.isActive,
    },
  }));
}

function livePromotionInventoryLoader({ items }) {
  return items.map((item) => ({
    id: item.id,
    code: item.inventoryCode,
    type: item.promotionInventoryType,
    size: item.size || "-",
    stock: item.currentStock,
    unitCost: Number(item.unitCost || 0),
    status: stockStatus(item.currentStock, item.reorderLevel, item.isActive),
    detail: {
      "Inventory Code": item.inventoryCode,
      Type: item.promotionInventoryType,
      Size: item.size || "-",
      "Current Stock": item.currentStock,
      "Reorder Level": item.reorderLevel,
      "Unit Cost": formatCurrency(item.unitCost),
      "Last Restock": formatDate(item.lastRestockDate),
      Status: stockStatus(item.currentStock, item.reorderLevel, item.isActive),
      Description: item.description || "-",
    },
    raw: {
      inventoryCode: item.inventoryCode,
      promotionInventoryType: item.promotionInventoryType,
      size: item.size || "",
      unitCost: Number(item.unitCost || 0),
      currentStock: item.currentStock,
      reorderLevel: item.reorderLevel,
      description: item.description || "",
      lastRestockDate: item.lastRestockDate ? new Date(item.lastRestockDate).toISOString().slice(0, 10) : "",
      isActive: item.isActive,
    },
  }));
}

function liveEventLoader({ items }) {
  return items.map((item) => ({
    id: item.id,
    code: `EVT-${item.id}`,
    name: item.eventName,
    type: humanizeEnum(item.type),
    startDate: item.startDate,
    city: item.city || item.country,
    owner: item.employee?.name || "Unassigned",
    status: item.isActive ? "Active" : "Inactive",
    detail: {
      Name: item.eventName,
      Type: humanizeEnum(item.type),
      "Start Date": formatDate(item.startDate),
      "End Date": formatDate(item.endDate),
      Country: item.country,
      State: item.state || "-",
      City: item.city || "-",
      Owner: item.employee?.name || "-",
      Status: item.isActive ? "Active" : "Inactive",
      Description: item.description || "-",
    },
    raw: {
      eventName: item.eventName,
      description: item.description || "",
      type: item.type,
      startDate: item.startDate ? new Date(item.startDate).toISOString().slice(0, 10) : "",
      endDate: item.endDate ? new Date(item.endDate).toISOString().slice(0, 10) : "",
      country: item.country,
      state: item.state || "",
      city: item.city || "",
      employeeId: item.employeeId ?? "",
      isActive: item.isActive,
    },
  }));
}

function livePromotionAssetLoader({ items }) {
  return items.map((item) => ({
    id: item.id,
    code: item.assetCode,
    name: item.assetName,
    category: humanizeEnum(item.assetCategory),
    assetType: humanizeEnum(item.assetType),
    status: item.isActive ? "Active" : "Inactive",
    detail: {
      "Asset Code": item.assetCode,
      "Asset Name": item.assetName,
      Category: humanizeEnum(item.assetCategory),
      "Asset Type": humanizeEnum(item.assetType),
      Status: item.isActive ? "Active" : "Inactive",
      Description: item.description || "-",
    },
    raw: {
      assetCode: item.assetCode,
      assetCategory: item.assetCategory,
      assetName: item.assetName,
      description: item.description || "",
      assetType: item.assetType,
      isActive: item.isActive,
    },
  }));
}

function liveVendorLoader({ items }) {
  return items.map((item) => ({
    id: item.id,
    code: item.vendorCode,
    name: item.name,
    contactPerson: item.contactPerson || "-",
    supplyType: item.supplyType || "-",
    rating: item.rating || "-",
    status: item.isActive ? "Active" : "Inactive",
    email: item.email || "No email",
    detail: {
      "Vendor Code": item.vendorCode,
      Name: item.name,
      Contact: item.contactPerson || "-",
      Phone: item.phoneNumber || "-",
      Email: item.email || "-",
      Address: item.address || "-",
      Rating: item.rating || "-",
      "Supply Type": item.supplyType || "-",
      "Last Supply Date": formatDate(item.lastSupplyDate),
      Status: item.isActive ? "Active" : "Inactive",
    },
    raw: {
      vendorCode: item.vendorCode,
      name: item.name,
      contactPerson: item.contactPerson || "",
      phoneNumber: item.phoneNumber || "",
      address: item.address || "",
      email: item.email || "",
      rating: item.rating ?? "",
      supplyType: item.supplyType || "",
      lastSupplyDate: item.lastSupplyDate ? new Date(item.lastSupplyDate).toISOString().slice(0, 10) : "",
      isActive: item.isActive,
    },
  }));
}

function liveInvoiceLoader({ items }) {
  return items.map((item) => ({
    id: item.id,
    code: item.invoiceNumber,
    vendor: item.vendor?.name || "Unknown vendor",
    invoiceDate: item.invoiceDate,
    dueDate: item.dueDate,
    total: Number(item.totalAmount || 0),
    status: humanizeEnum(item.status),
    detail: {
      "Invoice Number": item.invoiceNumber,
      Vendor: item.vendor?.name || "-",
      Owner: item.employee?.name || "-",
      "Invoice Date": formatDate(item.invoiceDate),
      "Due Date": formatDate(item.dueDate),
      Subtotal: formatCurrency(item.subtotal),
      Tax: formatCurrency(item.taxAmount),
      Total: formatCurrency(item.totalAmount),
      Status: humanizeEnum(item.status),
      "Invoice Items":
        item.items?.length > 0
          ? item.items.map((line, index) => {
              const sourceLabel =
                line.box?.boxCode ||
                line.envelope?.envelopeCode ||
                line.promotionInventory?.inventoryCode ||
                "Custom line";

              return `${index + 1}. ${line.description || sourceLabel} · Qty ${line.quantity} · ${formatCurrency(
                line.amount,
              )}`;
            })
          : ["No invoice items linked yet."],
      Notes: item.notes || "-",
    },
    raw: {
      invoiceNumber: item.invoiceNumber,
      employeeId: item.employeeId ?? "",
      invoiceDate: item.invoiceDate ? new Date(item.invoiceDate).toISOString().slice(0, 10) : "",
      dueDate: item.dueDate ? new Date(item.dueDate).toISOString().slice(0, 10) : "",
      vendorId: item.vendorId,
      status: item.status,
      notes: item.notes || "",
      subtotal: Number(item.subtotal || 0),
      taxAmount: Number(item.taxAmount || 0),
      totalAmount: Number(item.totalAmount || 0),
    },
  }));
}

function livePayableLoader({ items }) {
  return items.map((item) => ({
    id: item.id,
    code: `PAYABLE-${item.id}`,
    invoice: item.invoice?.invoiceNumber || "-",
    dueDate: item.dueDate,
    remainingAmount: Number(item.remainingAmount || 0),
    paymentTerms: item.paymentTerms || "-",
    status: humanizeEnum(item.status),
    detail: {
      Invoice: item.invoice?.invoiceNumber || "-",
      Vendor: item.invoice?.vendor?.name || "-",
      "Due Date": formatDate(item.dueDate),
      "Remaining Amount": formatCurrency(item.remainingAmount),
      "Payment Terms": item.paymentTerms || "-",
      Status: humanizeEnum(item.status),
      Notes: item.notes || "-",
    },
    raw: {
      invoiceId: item.invoiceId,
      remainingAmount: Number(item.remainingAmount || 0),
      dueDate: item.dueDate ? new Date(item.dueDate).toISOString().slice(0, 10) : "",
      paymentTerms: item.paymentTerms || "",
      notes: item.notes || "",
      status: item.status,
    },
  }));
}

function livePaymentLoader({ items }) {
  return items.map((item) => ({
    id: item.id,
    code: item.referenceNumber || `PAY-${item.id}`,
    payable: item.payable?.invoice?.invoiceNumber || `Payable #${item.payableId}`,
    amount: Number(item.amount || 0),
    paymentDate: item.paymentDate,
    paymentMethod: humanizeEnum(item.paymentMethod),
    status: "Posted",
    detail: {
      Payable: item.payable?.invoice?.invoiceNumber || `Payable #${item.payableId}`,
      Vendor: item.payable?.invoice?.vendor?.name || "-",
      Amount: formatCurrency(item.amount),
      "Payment Date": formatDate(item.paymentDate),
      "Payment Method": humanizeEnum(item.paymentMethod),
      Reference: item.referenceNumber || "-",
      Notes: item.notes || "-",
      Status: "Posted",
    },
    raw: {
      payableId: item.payableId,
      amount: Number(item.amount || 0),
      paymentDate: item.paymentDate ? new Date(item.paymentDate).toISOString().slice(0, 10) : "",
      paymentMethod: item.paymentMethod,
      referenceNumber: item.referenceNumber || "",
      notes: item.notes || "",
    },
  }));
}

function scaffoldRows(key) {
  return (staticModuleRows[key] || []).map((item) => ({
    ...item,
    detail: Object.fromEntries(
      Object.entries(item).map(([field, value]) => [
        field.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase()),
        value ?? "-",
      ]),
    ),
  }));
}

export const adminModuleConfig = {
  employees: {
    title: "Employee management",
    eyebrow: "Live module",
    description: "Review employee profiles, login attributes, role assignment, and password setup status.",
    statusKey: "status",
    searchKeys: ["code", "name", "username", "gender", "maritalStatus", "role", "position"],
    columns: [
      { key: "code", label: "Employee ID" },
      { key: "name", label: "Name" },
      { key: "username", label: "Username" },
      { key: "gender", label: "Gender" },
      { key: "maritalStatus", label: "Marital" },
      { key: "role", label: "Role" },
      { key: "status", label: "Status", isStatus: true },
    ],
    live: {
      endpoint: "/employees?page=1&pageSize=100",
      mapData: liveEmployeeLoader,
      createEndpoint: "/employees",
      updateEndpoint: (id) => `/employees/${id}`,
      deleteEndpoint: (id) => `/employees/${id}`,
    },
    analytics: {
      enabled: true,
    },
    formFields: [
      { key: "employeeCode", label: "Employee Code", type: "text" },
      { key: "name", label: "Name", type: "text", required: true },
      { key: "email", label: "Username / Login Email", type: "text" },
      {
        key: "gender",
        label: "Gender",
        type: "select",
        options: ["FEMALE", "MALE", "NON_BINARY", "PREFER_NOT_TO_SAY"],
      },
      {
        key: "maritalStatus",
        label: "Marital Status",
        type: "select",
        options: ["SINGLE", "MARRIED", "PREFER_NOT_TO_SAY"],
      },
      { key: "birthday", label: "Birthday", type: "date" },
      { key: "contact", label: "Contact", type: "text" },
      { key: "schedule", label: "Legacy Schedule Note", type: "text" },
      { key: "hometown", label: "Hometown", type: "text" },
      { key: "position", label: "Position", type: "text" },
      {
        key: "role",
        label: "Role",
        type: "select",
        options: ["ADMIN", "OPERATIONS", "FINANCE", "EVENT", "VOLUNTEER"],
      },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: ["ACTIVE", "INACTIVE"],
      },
      { key: "password", label: "Set New Password", type: "password" },
    ],
  },
  schedules: {
    title: "Schedule management",
    eyebrow: "Live module",
    description: "Manage employee shifts, event-linked schedules, and day-by-day staffing visibility.",
    statusKey: "status",
    searchKeys: ["code", "employee", "event", "shiftWindow", "status"],
    columns: [
      { key: "code", label: "Schedule ID" },
      { key: "employee", label: "Employee" },
      { key: "event", label: "Event" },
      { key: "shiftDate", label: "Shift Date", format: "date" },
      { key: "shiftWindow", label: "Time" },
      { key: "status", label: "Status", isStatus: true },
    ],
    live: {
      endpoint: "/schedules?page=1&pageSize=100",
      mapData: liveScheduleLoader,
      createEndpoint: "/schedules",
      updateEndpoint: (id) => `/schedules/${id}`,
      deleteEndpoint: (id) => `/schedules/${id}`,
    },
    analytics: {
      enabled: true,
    },
    formFields: [
      { key: "employeeId", label: "Employee ID", type: "number", required: true },
      { key: "eventId", label: "Event ID", type: "number" },
      { key: "shiftDate", label: "Shift Date", type: "date", required: true },
      { key: "startTime", label: "Start Time", type: "time", required: true },
      { key: "endTime", label: "End Time", type: "time", required: true },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: ["SCHEDULED", "COMPLETED", "CANCELLED"],
      },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
  },
  donors: {
    title: "Donor management",
    eyebrow: "Live module",
    description: "Track donor profiles, contact preferences, and registration details.",
    statusKey: "status",
    searchKeys: ["code", "name", "supporterType", "gender", "maritalStatus", "email", "location"],
    columns: [
      { key: "code", label: "ID", width: "minmax(84px, 0.7fr)" },
      { key: "name", label: "Name", width: "minmax(130px, 1.1fr)" },
      { key: "age", label: "Age", width: "minmax(54px, 0.45fr)" },
      { key: "gender", label: "Gender", width: "minmax(84px, 0.65fr)" },
      { key: "maritalStatus", label: "Marital", width: "minmax(84px, 0.7fr)" },
      { key: "supporterType", label: "Type", width: "minmax(84px, 0.65fr)" },
      { key: "location", label: "City", width: "minmax(110px, 0.9fr)" },
      { key: "status", label: "Status", isStatus: true, width: "minmax(88px, 0.7fr)" },
    ],
    live: {
      endpoint: "/donors?page=1&pageSize=100",
      mapData: liveDonorLoader,
    },
    analytics: {
      enabled: true,
    },
  },
  donations: {
    title: "Donation management",
    eyebrow: "Live module",
    description: "Follow donations from entry to ownership, event linkage, and kit assignment.",
    statusKey: "status",
    searchKeys: ["code", "donor", "frequency", "event", "kit", "owner"],
    columns: [
      { key: "code", label: "Donation ID" },
      { key: "donor", label: "Donor" },
      { key: "amount", label: "Amount" },
      { key: "frequency", label: "Frequency" },
      { key: "event", label: "Event" },
      { key: "owner", label: "Owner" },
      { key: "status", label: "Status", isStatus: true },
    ],
    live: {
      endpoint: "/donation-receivables?page=1&pageSize=100",
      mapData: liveDonationLoader,
    },
    analytics: {
      enabled: true,
    },
  },
  receipts: {
    title: "Receipt management",
    eyebrow: "Live module",
    description: "Review issued receipts, payment methods, and donor acknowledgment records.",
    statusKey: "status",
    searchKeys: ["code", "donor", "paymentMethod"],
    columns: [
      { key: "code", label: "Receipt ID" },
      { key: "donor", label: "Donor" },
      { key: "amount", label: "Amount", format: "currency" },
      { key: "paymentMethod", label: "Payment Method" },
      { key: "receiptDate", label: "Date", format: "date" },
      { key: "status", label: "Status", isStatus: true },
    ],
    live: {
      endpoint: "/receipts?page=1&pageSize=100",
      mapData: liveReceiptLoader,
      createEndpoint: "/receipts",
      updateEndpoint: (id) => `/receipts/${id}`,
      deleteEndpoint: (id) => `/receipts/${id}`,
    },
    analytics: {
      enabled: true,
    },
    formFields: [
      { key: "receiptNumber", label: "Receipt Number", type: "text" },
      { key: "donationId", label: "Donation ID", type: "number", required: true },
      { key: "amount", label: "Amount", type: "number", required: true, step: "0.01" },
      { key: "receiptDate", label: "Receipt Date", type: "date", required: true },
      {
        key: "paymentMethod",
        label: "Payment Method",
        type: "select",
        required: true,
        options: ["CASH", "CARD", "BANK_TRANSFER", "CHECK", "OTHER"],
      },
      { key: "transactionId", label: "Transaction ID", type: "text" },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: ["ISSUED", "VOID"],
      },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
  },
  shipping: {
    title: "Shipping management",
    eyebrow: "Live module",
    description: "Track outbound gift kits, carriers, tracking numbers, and delivery progress.",
    statusKey: "status",
    searchKeys: ["code", "donor", "carrier", "trackingNumber"],
    columns: [
      { key: "code", label: "Shipping ID" },
      { key: "donor", label: "Donor" },
      { key: "carrier", label: "Carrier" },
      { key: "trackingNumber", label: "Tracking" },
      { key: "shippedDate", label: "Shipped", format: "date" },
      { key: "status", label: "Status", isStatus: true },
    ],
    live: {
      endpoint: "/shippings?page=1&pageSize=100",
      mapData: liveShippingLoader,
      createEndpoint: "/shippings",
      updateEndpoint: (id) => `/shippings/${id}`,
      deleteEndpoint: (id) => `/shippings/${id}`,
    },
    analytics: {
      enabled: true,
    },
    formFields: [
      { key: "donationId", label: "Donation ID", type: "number", required: true },
      { key: "trackingNumber", label: "Tracking Number", type: "text" },
      { key: "carrier", label: "Carrier", type: "text" },
      { key: "shippedDate", label: "Shipped Date", type: "date" },
      { key: "deliveryDate", label: "Delivery Date", type: "date" },
      { key: "shippingCost", label: "Shipping Cost", type: "number", step: "0.01" },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: ["PENDING", "PREPARING", "SHIPPED", "DELIVERED", "RETURNED", "LOST"],
      },
    ],
  },
  feedback: {
    title: "Feedback management",
    eyebrow: "Live module",
    description: "Monitor donor reactions, ratings, and response workflow.",
    statusKey: "status",
    searchKeys: ["code", "donor", "comment"],
    columns: [
      { key: "code", label: "Feedback ID" },
      { key: "donor", label: "Donor" },
      { key: "rating", label: "Rating" },
      { key: "feedbackDate", label: "Date", format: "date" },
      { key: "status", label: "Status", isStatus: true },
    ],
    live: {
      endpoint: "/feedback?page=1&pageSize=100",
      mapData: liveFeedbackLoader,
      createEndpoint: "/feedback",
      updateEndpoint: (id) => `/feedback/${id}`,
      deleteEndpoint: (id) => `/feedback/${id}`,
    },
    analytics: {
      enabled: true,
    },
    formFields: [
      { key: "donationId", label: "Donation ID", type: "number", required: true },
      { key: "feedbackContent", label: "Feedback", type: "textarea", required: true },
      { key: "rating", label: "Rating", type: "number", min: "1", max: "5" },
      { key: "feedbackDate", label: "Feedback Date", type: "date", required: true },
      { key: "responseContent", label: "Response", type: "textarea" },
      { key: "responseDate", label: "Response Date", type: "date" },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: ["NEW", "REVIEWED", "RESPONDED", "CLOSED"],
      },
    ],
  },
  "donation-kits": {
    title: "Donation kit management",
    eyebrow: "Live module",
    description: "Manage donor gift kit definitions, activation state, and component mix.",
    statusKey: "active",
    searchKeys: ["code", "name", "description"],
    columns: [
      { key: "code", label: "Kit Code" },
      { key: "name", label: "Kit Name" },
      { key: "components", label: "Components" },
      { key: "estimatedCost", label: "Estimated Cost", format: "currency" },
      { key: "active", label: "Status", isStatus: true },
    ],
    live: {
      endpoint: "/donation-kits?page=1&pageSize=100",
      mapData: liveDonationKitLoader,
      createEndpoint: "/donation-kits",
      updateEndpoint: (id) => `/donation-kits/${id}`,
      deleteEndpoint: (id) => `/donation-kits/${id}`,
    },
    analytics: {
      enabled: true,
    },
    formFields: [
      { key: "kitCode", label: "Kit Code", type: "text" },
      { key: "kitName", label: "Kit Name", type: "text", required: true },
      { key: "description", label: "Description", type: "textarea" },
      { key: "isActive", label: "Active", type: "boolean" },
    ],
  },
  books: {
    title: "Book management",
    eyebrow: "Live module",
    description: "Review book formats, stock levels, and reorder signals.",
    statusKey: "status",
    searchKeys: ["code", "title", "format"],
    columns: [
      { key: "code", label: "Book ID" },
      { key: "title", label: "Title" },
      { key: "format", label: "Format" },
      { key: "stock", label: "Stock" },
      { key: "unitCost", label: "Unit Cost", format: "currency" },
      { key: "status", label: "Status", isStatus: true },
    ],
    live: {
      endpoint: "/books?page=1&pageSize=100",
      mapData: liveBookLoader,
      createEndpoint: "/books",
      updateEndpoint: (id) => `/books/${id}`,
      deleteEndpoint: (id) => `/books/${id}`,
    },
    analytics: {
      enabled: true,
    },
    formFields: [
      { key: "pressId", label: "Press ID", type: "number", required: true },
      { key: "bookSeriesId", label: "Series ID", type: "number" },
      { key: "title", label: "Title", type: "text", required: true },
      { key: "bookFormatId", label: "Format ID", type: "number", required: true },
      { key: "description", label: "Description", type: "textarea" },
      { key: "pageCount", label: "Page Count", type: "number" },
      { key: "unitCost", label: "Unit Cost", type: "number", required: true, step: "0.01" },
      { key: "currentStock", label: "Current Stock", type: "number" },
      { key: "reorderLevel", label: "Reorder Level", type: "number" },
      { key: "publicationDate", label: "Publication Date", type: "date" },
    ],
  },
  envelopes: {
    title: "Envelope inventory",
    eyebrow: "Live module",
    description: "Monitor packaging stock, reorder levels, and item cost.",
    statusKey: "status",
    searchKeys: ["code", "size"],
    columns: [
      { key: "code", label: "Envelope Code" },
      { key: "size", label: "Size" },
      { key: "stock", label: "Stock" },
      { key: "reorderLevel", label: "Reorder Level" },
      { key: "unitCost", label: "Unit Cost", format: "currency" },
      { key: "status", label: "Status", isStatus: true },
    ],
    live: {
      endpoint: "/envelopes?page=1&pageSize=100",
      mapData: liveEnvelopeLoader,
      createEndpoint: "/envelopes",
      updateEndpoint: (id) => `/envelopes/${id}`,
      deleteEndpoint: (id) => `/envelopes/${id}`,
    },
    analytics: {
      enabled: true,
    },
    formFields: [
      { key: "envelopeCode", label: "Envelope Code", type: "text" },
      { key: "size", label: "Size", type: "text", required: true },
      { key: "unitCost", label: "Unit Cost", type: "number", required: true, step: "0.01" },
      { key: "currentStock", label: "Current Stock", type: "number" },
      { key: "reorderLevel", label: "Reorder Level", type: "number" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "lastRestockDate", label: "Last Restock Date", type: "date" },
      { key: "isActive", label: "Active", type: "boolean" },
    ],
  },
  boxes: {
    title: "Box inventory",
    eyebrow: "Live module",
    description: "Track box stock and highlight low-supply packaging items.",
    statusKey: "status",
    searchKeys: ["code", "size"],
    columns: [
      { key: "code", label: "Box Code" },
      { key: "size", label: "Size" },
      { key: "stock", label: "Stock" },
      { key: "reorderLevel", label: "Reorder Level" },
      { key: "unitCost", label: "Unit Cost", format: "currency" },
      { key: "status", label: "Status", isStatus: true },
    ],
    live: {
      endpoint: "/boxes?page=1&pageSize=100",
      mapData: liveBoxLoader,
      createEndpoint: "/boxes",
      updateEndpoint: (id) => `/boxes/${id}`,
      deleteEndpoint: (id) => `/boxes/${id}`,
    },
    analytics: {
      enabled: true,
    },
    formFields: [
      { key: "boxCode", label: "Box Code", type: "text" },
      { key: "size", label: "Size", type: "text", required: true },
      { key: "unitCost", label: "Unit Cost", type: "number", required: true, step: "0.01" },
      { key: "currentStock", label: "Current Stock", type: "number" },
      { key: "reorderLevel", label: "Reorder Level", type: "number" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "lastRestockDate", label: "Last Restock Date", type: "date" },
      { key: "isActive", label: "Active", type: "boolean" },
    ],
  },
  "promotion-inventory": {
    title: "Promotion inventory",
    eyebrow: "Live module",
    description: "Watch event giveaway stock, print quantities, and replenishment levels.",
    statusKey: "status",
    searchKeys: ["code", "type", "size"],
    columns: [
      { key: "code", label: "Inventory Code" },
      { key: "type", label: "Type" },
      { key: "size", label: "Size" },
      { key: "stock", label: "Stock" },
      { key: "unitCost", label: "Unit Cost", format: "currency" },
      { key: "status", label: "Status", isStatus: true },
    ],
    live: {
      endpoint: "/promotion-inventory?page=1&pageSize=100",
      mapData: livePromotionInventoryLoader,
      createEndpoint: "/promotion-inventory",
      updateEndpoint: (id) => `/promotion-inventory/${id}`,
      deleteEndpoint: (id) => `/promotion-inventory/${id}`,
    },
    analytics: {
      enabled: true,
    },
    formFields: [
      { key: "inventoryCode", label: "Inventory Code", type: "text" },
      { key: "promotionInventoryType", label: "Type", type: "text", required: true },
      { key: "size", label: "Size", type: "text" },
      { key: "unitCost", label: "Unit Cost", type: "number", required: true, step: "0.01" },
      { key: "currentStock", label: "Current Stock", type: "number" },
      { key: "reorderLevel", label: "Reorder Level", type: "number" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "lastRestockDate", label: "Last Restock Date", type: "date" },
      { key: "isActive", label: "Active", type: "boolean" },
    ],
  },
  events: {
    title: "Event management",
    eyebrow: "Live module",
    description: "Keep event schedules, locations, owners, and active campaign moments visible.",
    statusKey: "status",
    searchKeys: ["code", "name", "type", "city", "owner"],
    columns: [
      { key: "code", label: "Event ID" },
      { key: "name", label: "Name" },
      { key: "type", label: "Type" },
      { key: "startDate", label: "Start Date", format: "date" },
      { key: "city", label: "City" },
      { key: "status", label: "Status", isStatus: true },
    ],
    live: {
      endpoint: "/events?page=1&pageSize=100",
      mapData: liveEventLoader,
      createEndpoint: "/events",
      updateEndpoint: (id) => `/events/${id}`,
      deleteEndpoint: (id) => `/events/${id}`,
    },
    analytics: {
      enabled: true,
    },
    formFields: [
      { key: "eventName", label: "Event Name", type: "text", required: true },
      { key: "description", label: "Description", type: "textarea" },
      {
        key: "type",
        label: "Type",
        type: "select",
        options: ["FUNDRAISER", "SCHOOL_VISIT", "COMMUNITY_OUTREACH", "ONLINE_CAMPAIGN", "BOOK_LAUNCH", "OTHER"],
      },
      { key: "startDate", label: "Start Date", type: "date", required: true },
      { key: "endDate", label: "End Date", type: "date" },
      { key: "country", label: "Country", type: "text", required: true },
      { key: "state", label: "State", type: "text" },
      { key: "city", label: "City", type: "text" },
      { key: "employeeId", label: "Owner Employee ID", type: "number" },
      { key: "isActive", label: "Active", type: "boolean" },
    ],
  },
  "promotion-assets": {
    title: "Promotion asset management",
    eyebrow: "Live module",
    description: "Review active campaign assets and their category mix for outreach planning.",
    statusKey: "status",
    searchKeys: ["code", "name", "category", "assetType"],
    columns: [
      { key: "code", label: "Asset ID" },
      { key: "name", label: "Asset Name" },
      { key: "category", label: "Category" },
      { key: "assetType", label: "Asset Type" },
      { key: "status", label: "Status", isStatus: true },
    ],
    live: {
      endpoint: "/promotion-assets?page=1&pageSize=100",
      mapData: livePromotionAssetLoader,
      createEndpoint: "/promotion-assets",
      updateEndpoint: (id) => `/promotion-assets/${id}`,
      deleteEndpoint: (id) => `/promotion-assets/${id}`,
    },
    analytics: {
      enabled: true,
    },
    formFields: [
      { key: "assetCode", label: "Asset Code", type: "text" },
      { key: "assetName", label: "Asset Name", type: "text", required: true },
      {
        key: "assetCategory",
        label: "Category",
        type: "select",
        options: ["PRINT", "DIGITAL", "MERCHANDISE", "DISPLAY", "OTHER"],
      },
      {
        key: "assetType",
        label: "Asset Type",
        type: "select",
        options: ["FLYER", "POSTER", "BANNER", "BOOKMARK", "STICKER", "GIFT", "OTHER"],
      },
      { key: "description", label: "Description", type: "textarea" },
      { key: "isActive", label: "Active", type: "boolean" },
    ],
  },
  vendors: {
    title: "Vendor management",
    eyebrow: "Live module",
    description: "Track external suppliers, contact points, supply categories, and ratings.",
    statusKey: "status",
    searchKeys: ["code", "name", "contactPerson", "supplyType", "email"],
    columns: [
      { key: "code", label: "Vendor ID" },
      { key: "name", label: "Vendor" },
      { key: "contactPerson", label: "Contact" },
      { key: "supplyType", label: "Supply Type" },
      { key: "rating", label: "Rating" },
      { key: "status", label: "Status", isStatus: true },
    ],
    live: {
      endpoint: "/vendors?page=1&pageSize=100",
      mapData: liveVendorLoader,
      createEndpoint: "/vendors",
      updateEndpoint: (id) => `/vendors/${id}`,
      deleteEndpoint: (id) => `/vendors/${id}`,
    },
    analytics: {
      enabled: true,
    },
    formFields: [
      { key: "vendorCode", label: "Vendor Code", type: "text" },
      { key: "name", label: "Vendor Name", type: "text", required: true },
      { key: "contactPerson", label: "Contact Person", type: "text" },
      { key: "phoneNumber", label: "Phone Number", type: "text" },
      { key: "address", label: "Address", type: "textarea" },
      { key: "email", label: "Email", type: "text" },
      { key: "rating", label: "Rating", type: "number", min: "1", max: "5" },
      { key: "supplyType", label: "Supply Type", type: "text" },
      { key: "lastSupplyDate", label: "Last Supply Date", type: "date" },
      { key: "isActive", label: "Active", type: "boolean" },
    ],
  },
  invoices: {
    title: "Invoice management",
    eyebrow: "Live module",
    description: "See invoice timing, vendor ownership, and payment progress in one place.",
    statusKey: "status",
    searchKeys: ["code", "vendor"],
    columns: [
      { key: "code", label: "Invoice ID" },
      { key: "vendor", label: "Vendor" },
      { key: "invoiceDate", label: "Invoice Date", format: "date" },
      { key: "dueDate", label: "Due Date", format: "date" },
      { key: "total", label: "Total", format: "currency" },
      { key: "status", label: "Status", isStatus: true },
    ],
    live: {
      endpoint: "/invoices?page=1&pageSize=100",
      mapData: liveInvoiceLoader,
      createEndpoint: "/invoices",
      updateEndpoint: (id) => `/invoices/${id}`,
      deleteEndpoint: (id) => `/invoices/${id}`,
    },
    analytics: {
      enabled: true,
    },
    formFields: [
      { key: "invoiceNumber", label: "Invoice Number", type: "text" },
      { key: "vendorId", label: "Vendor ID", type: "number", required: true },
      { key: "employeeId", label: "Owner Employee ID", type: "number" },
      { key: "invoiceDate", label: "Invoice Date", type: "date", required: true },
      { key: "dueDate", label: "Due Date", type: "date", required: true },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: ["DRAFT", "PENDING_APPROVAL", "APPROVED", "PARTIALLY_PAID", "PAID", "OVERDUE", "CANCELLED"],
      },
      { key: "subtotal", label: "Subtotal", type: "number", step: "0.01" },
      { key: "taxAmount", label: "Tax Amount", type: "number", step: "0.01" },
      { key: "totalAmount", label: "Total Amount", type: "number", step: "0.01" },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
  },
  payables: {
    title: "Payables management",
    eyebrow: "Live module",
    description: "Monitor outstanding amounts, due dates, and current payable status.",
    statusKey: "status",
    searchKeys: ["code", "invoice", "paymentTerms"],
    columns: [
      { key: "code", label: "Payable ID" },
      { key: "invoice", label: "Invoice" },
      { key: "dueDate", label: "Due Date", format: "date" },
      { key: "remainingAmount", label: "Remaining", format: "currency" },
      { key: "paymentTerms", label: "Terms" },
      { key: "status", label: "Status", isStatus: true },
    ],
    live: {
      endpoint: "/payables?page=1&pageSize=100",
      mapData: livePayableLoader,
      createEndpoint: "/payables",
      updateEndpoint: (id) => `/payables/${id}`,
      deleteEndpoint: (id) => `/payables/${id}`,
    },
    analytics: {
      enabled: true,
    },
    formFields: [
      { key: "invoiceId", label: "Invoice ID", type: "number", required: true },
      { key: "remainingAmount", label: "Remaining Amount", type: "number", required: true, step: "0.01" },
      { key: "dueDate", label: "Due Date", type: "date", required: true },
      { key: "paymentTerms", label: "Payment Terms", type: "text" },
      { key: "notes", label: "Notes", type: "textarea" },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: ["OPEN", "PARTIALLY_PAID", "PAID", "OVERDUE", "CANCELLED"],
      },
    ],
  },
  payments: {
    title: "Payment management",
    eyebrow: "Live module",
    description: "Track outgoing payments, methods, dates, and posting state.",
    statusKey: "status",
    searchKeys: ["code", "payable", "paymentMethod"],
    columns: [
      { key: "code", label: "Payment ID" },
      { key: "payable", label: "Payable" },
      { key: "amount", label: "Amount", format: "currency" },
      { key: "paymentDate", label: "Payment Date", format: "date" },
      { key: "paymentMethod", label: "Method" },
      { key: "status", label: "Status", isStatus: true },
    ],
    live: {
      endpoint: "/payments?page=1&pageSize=100",
      mapData: livePaymentLoader,
      createEndpoint: "/payments",
      updateEndpoint: (id) => `/payments/${id}`,
      deleteEndpoint: (id) => `/payments/${id}`,
    },
    analytics: {
      enabled: true,
    },
    formFields: [
      { key: "payableId", label: "Payable ID", type: "number", required: true },
      { key: "amount", label: "Amount", type: "number", required: true, step: "0.01" },
      { key: "paymentDate", label: "Payment Date", type: "date", required: true },
      {
        key: "paymentMethod",
        label: "Payment Method",
        type: "select",
        required: true,
        options: ["CASH", "CARD", "BANK_TRANSFER", "CHECK", "OTHER"],
      },
      { key: "referenceNumber", label: "Reference Number", type: "text" },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
  },
};

export const adminModuleKeys = Object.keys(adminModuleConfig);

export function getAdminModuleConfig(moduleKey) {
  const config = adminModuleConfig[moduleKey];

  if (!config) {
    return null;
  }

  return {
    ...config,
    scaffoldRows: scaffoldRows(moduleKey),
    emptyRows: moduleKey === "donors" ? donorRows : moduleKey === "donations" ? donationRows : [],
  };
}
