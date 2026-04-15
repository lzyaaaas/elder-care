const { prisma } = require("../../config/prisma");

function humanizeEnum(value) {
  return String(value || "")
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function calculateAge(value) {
  if (!value) {
    return null;
  }

  const birthday = new Date(value);

  if (Number.isNaN(birthday.getTime())) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - birthday.getFullYear();
  const monthDiff = today.getMonth() - birthday.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthday.getDate())) {
    age -= 1;
  }

  return age;
}

function uniqueOptions(values) {
  return [...new Set(values.filter((value) => value !== null && value !== undefined && value !== ""))].map((value) => ({
    label: typeof value === "string" ? humanizeEnum(value) : String(value),
    value: String(value),
  }));
}

function groupCounts(rows, getValue, { formatter, limit = 8 } = {}) {
  const counts = rows.reduce((accumulator, row) => {
    const rawValue = getValue(row);
    const key = rawValue ?? "Unknown";
    accumulator[key] = (accumulator[key] || 0) + 1;
    return accumulator;
  }, {});

  return Object.entries(counts)
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit)
    .map(([label, value]) => ({
      label: formatter ? formatter(label) : String(label),
      value,
    }));
}

function bucketAges(rows, getAge) {
  const buckets = {
    "Under 25": 0,
    "25-34": 0,
    "35-44": 0,
    "45-54": 0,
    "55+": 0,
    Unknown: 0,
  };

  rows.forEach((row) => {
    const age = getAge(row);

    if (age == null) {
      buckets.Unknown += 1;
      return;
    }

    if (age < 25) {
      buckets["Under 25"] += 1;
    } else if (age < 35) {
      buckets["25-34"] += 1;
    } else if (age < 45) {
      buckets["35-44"] += 1;
    } else if (age < 55) {
      buckets["45-54"] += 1;
    } else {
      buckets["55+"] += 1;
    }
  });

  return Object.entries(buckets).map(([label, value]) => ({ label, value }));
}

function monthKey(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function groupByMonth(rows, getDate) {
  const counts = rows.reduce((accumulator, row) => {
    const key = monthKey(getDate(row));

    if (!key) {
      return accumulator;
    }

    accumulator[key] = (accumulator[key] || 0) + 1;
    return accumulator;
  }, {});

  return Object.entries(counts)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([label, value]) => ({ label, value }));
}

function relationCount(row, key) {
  return Array.isArray(row[key]) ? row[key].length : 0;
}

function parseDateValue(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.getTime();
}

function parseNumberValue(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numericValue = Number(value);
  return Number.isNaN(numericValue) ? null : numericValue;
}

function coerceAttributeValue(attribute, row) {
  const value = attribute.getValue(row);

  if (attribute.type === "number" || attribute.type === "count") {
    return parseNumberValue(value);
  }

  if (attribute.type === "date") {
    return parseDateValue(value);
  }

  if (attribute.type === "boolean") {
    return Boolean(value);
  }

  return value;
}

function matchesFilter(row, attribute, filter) {
  const actualValue = coerceAttributeValue(attribute, row);
  const expectedValue =
    attribute.type === "number" || attribute.type === "count"
      ? parseNumberValue(filter.value)
      : attribute.type === "date"
        ? parseDateValue(filter.value)
        : filter.value;
  const expectedValueTo =
    attribute.type === "number" || attribute.type === "count"
      ? parseNumberValue(filter.valueTo)
      : attribute.type === "date"
        ? parseDateValue(filter.valueTo)
        : filter.valueTo;

  switch (filter.operator) {
    case "equals":
    case "eq":
      if (attribute.type === "boolean") {
        return actualValue === (String(filter.value) === "true");
      }

      return String(actualValue ?? "").toLowerCase() === String(expectedValue ?? "").toLowerCase();
    case "contains":
      return String(actualValue ?? "")
        .toLowerCase()
        .includes(String(expectedValue ?? "").toLowerCase());
    case "in": {
      const candidates = String(filter.value || "")
        .split(",")
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean);
      return candidates.includes(String(actualValue ?? "").toLowerCase());
    }
    case "gt":
      return (actualValue ?? -Infinity) > (expectedValue ?? Infinity);
    case "gte":
      return (actualValue ?? -Infinity) >= (expectedValue ?? Infinity);
    case "lt":
      return (actualValue ?? Infinity) < (expectedValue ?? -Infinity);
    case "before":
      return (actualValue ?? Infinity) < (expectedValue ?? -Infinity);
    case "after":
      return (actualValue ?? -Infinity) > (expectedValue ?? Infinity);
    case "between":
      if (expectedValue == null || expectedValueTo == null || actualValue == null) {
        return false;
      }

      return actualValue >= expectedValue && actualValue <= expectedValueTo;
    default:
      return true;
  }
}

function normalizeMetadataAttributes(attributes) {
  return attributes.map(({ getValue, ...attribute }) => attribute);
}

function donorsAttributes(rows) {
  return [
    {
      key: "gender",
      label: "Gender",
      type: "enum",
      operators: ["equals", "in"],
      options: uniqueOptions(rows.map((row) => row.gender)),
      getValue: (row) => row.gender,
    },
    {
      key: "age",
      label: "Age",
      type: "number",
      operators: ["eq", "gt", "gte", "lt", "between"],
      getValue: (row) => calculateAge(row.birthday),
    },
    {
      key: "birthday",
      label: "Birthday",
      type: "date",
      operators: ["before", "after", "between"],
      getValue: (row) => row.birthday,
    },
    {
      key: "city",
      label: "City",
      type: "text",
      operators: ["contains", "equals"],
      options: uniqueOptions(rows.map((row) => row.city)),
      getValue: (row) => row.city,
    },
    {
      key: "supporterType",
      label: "Supporter Type",
      type: "enum",
      operators: ["equals", "in"],
      options: uniqueOptions(rows.map((row) => row.supporterType)),
      getValue: (row) => row.supporterType,
    },
    {
      key: "maritalStatus",
      label: "Marital Status",
      type: "enum",
      operators: ["equals", "in"],
      options: uniqueOptions(rows.map((row) => row.maritalStatus)),
      getValue: (row) => row.maritalStatus,
    },
    {
      key: "accountStatus",
      label: "Account Status",
      type: "enum",
      operators: ["equals", "in"],
      options: uniqueOptions(rows.map((row) => row.accountStatus)),
      getValue: (row) => row.accountStatus,
    },
    {
      key: "sourceEvent",
      label: "Source Event",
      type: "text",
      operators: ["contains", "equals"],
      options: uniqueOptions(rows.map((row) => row.sourceEvent?.eventName)),
      getValue: (row) => row.sourceEvent?.eventName,
    },
    {
      key: "donationsCount",
      label: "Donations Count",
      type: "count",
      operators: ["eq", "gt", "gte", "lt", "between"],
      getValue: (row) => relationCount(row, "donations"),
    },
    {
      key: "feedbackCount",
      label: "Feedback Count",
      type: "count",
      operators: ["eq", "gt", "gte", "lt", "between"],
      getValue: (row) => row.donations.reduce((count, donation) => count + relationCount(donation, "feedbacks"), 0),
    },
  ];
}

function donationsAttributes(rows) {
  return [
    {
      key: "status",
      label: "Status",
      type: "enum",
      operators: ["equals", "in"],
      options: uniqueOptions(rows.map((row) => row.status)),
      getValue: (row) => row.status,
    },
    {
      key: "donationFrequency",
      label: "Frequency",
      type: "enum",
      operators: ["equals", "in"],
      options: uniqueOptions(rows.map((row) => row.donationFrequency)),
      getValue: (row) => row.donationFrequency,
    },
    {
      key: "donationAmount",
      label: "Donation Amount",
      type: "number",
      operators: ["eq", "gt", "gte", "lt", "between"],
      getValue: (row) => row.donationAmount,
    },
    {
      key: "donationDate",
      label: "Donation Date",
      type: "date",
      operators: ["before", "after", "between"],
      getValue: (row) => row.donationDate,
    },
    {
      key: "donorGender",
      label: "Donor Gender",
      type: "enum",
      operators: ["equals", "in"],
      options: uniqueOptions(rows.map((row) => row.donor?.gender)),
      getValue: (row) => row.donor?.gender,
    },
    {
      key: "donorAge",
      label: "Donor Age",
      type: "number",
      operators: ["eq", "gt", "gte", "lt", "between"],
      getValue: (row) => calculateAge(row.donor?.birthday),
    },
    {
      key: "eventName",
      label: "Event",
      type: "text",
      operators: ["contains", "equals"],
      options: uniqueOptions(rows.map((row) => row.event?.eventName)),
      getValue: (row) => row.event?.eventName,
    },
    {
      key: "receiptsCount",
      label: "Receipts Count",
      type: "count",
      operators: ["eq", "gt", "gte", "lt", "between"],
      getValue: (row) => relationCount(row, "receipts"),
    },
    {
      key: "shippingsCount",
      label: "Shipping Count",
      type: "count",
      operators: ["eq", "gt", "gte", "lt", "between"],
      getValue: (row) => relationCount(row, "shippings"),
    },
    {
      key: "feedbacksCount",
      label: "Feedback Count",
      type: "count",
      operators: ["eq", "gt", "gte", "lt", "between"],
      getValue: (row) => relationCount(row, "feedbacks"),
    },
  ];
}

function receiptsAttributes(rows) {
  return [
    {
      key: "status",
      label: "Status",
      type: "enum",
      operators: ["equals", "in"],
      options: uniqueOptions(rows.map((row) => row.status)),
      getValue: (row) => row.status,
    },
    {
      key: "paymentMethod",
      label: "Payment Method",
      type: "enum",
      operators: ["equals", "in"],
      options: uniqueOptions(rows.map((row) => row.paymentMethod)),
      getValue: (row) => row.paymentMethod,
    },
    {
      key: "amount",
      label: "Amount",
      type: "number",
      operators: ["eq", "gt", "gte", "lt", "between"],
      getValue: (row) => row.amount,
    },
    {
      key: "receiptDate",
      label: "Receipt Date",
      type: "date",
      operators: ["before", "after", "between"],
      getValue: (row) => row.receiptDate,
    },
    {
      key: "donorGender",
      label: "Donor Gender",
      type: "enum",
      operators: ["equals", "in"],
      options: uniqueOptions(rows.map((row) => row.donation?.donor?.gender)),
      getValue: (row) => row.donation?.donor?.gender,
    },
    {
      key: "eventName",
      label: "Event",
      type: "text",
      operators: ["contains", "equals"],
      options: uniqueOptions(rows.map((row) => row.donation?.event?.eventName)),
      getValue: (row) => row.donation?.event?.eventName,
    },
  ];
}

function shippingAttributes(rows) {
  return [
    {
      key: "status",
      label: "Status",
      type: "enum",
      operators: ["equals", "in"],
      options: uniqueOptions(rows.map((row) => row.status)),
      getValue: (row) => row.status,
    },
    {
      key: "carrier",
      label: "Carrier",
      type: "text",
      operators: ["contains", "equals"],
      options: uniqueOptions(rows.map((row) => row.carrier)),
      getValue: (row) => row.carrier,
    },
    {
      key: "shippingCost",
      label: "Shipping Cost",
      type: "number",
      operators: ["eq", "gt", "gte", "lt", "between"],
      getValue: (row) => row.shippingCost,
    },
    {
      key: "shippedDate",
      label: "Shipped Date",
      type: "date",
      operators: ["before", "after", "between"],
      getValue: (row) => row.shippedDate,
    },
    {
      key: "donorGender",
      label: "Donor Gender",
      type: "enum",
      operators: ["equals", "in"],
      options: uniqueOptions(rows.map((row) => row.donation?.donor?.gender)),
      getValue: (row) => row.donation?.donor?.gender,
    },
    {
      key: "eventName",
      label: "Event",
      type: "text",
      operators: ["contains", "equals"],
      options: uniqueOptions(rows.map((row) => row.donation?.event?.eventName)),
      getValue: (row) => row.donation?.event?.eventName,
    },
    {
      key: "employeeName",
      label: "Donation Owner",
      type: "text",
      operators: ["contains", "equals"],
      options: uniqueOptions(rows.map((row) => row.donation?.employee?.name)),
      getValue: (row) => row.donation?.employee?.name,
    },
  ];
}

function feedbackAttributes(rows) {
  return [
    {
      key: "status",
      label: "Status",
      type: "enum",
      operators: ["equals", "in"],
      options: uniqueOptions(rows.map((row) => row.status)),
      getValue: (row) => row.status,
    },
    {
      key: "rating",
      label: "Rating",
      type: "number",
      operators: ["eq", "gt", "gte", "lt", "between"],
      getValue: (row) => row.rating,
    },
    {
      key: "feedbackDate",
      label: "Feedback Date",
      type: "date",
      operators: ["before", "after", "between"],
      getValue: (row) => row.feedbackDate,
    },
    {
      key: "donorGender",
      label: "Donor Gender",
      type: "enum",
      operators: ["equals", "in"],
      options: uniqueOptions(rows.map((row) => row.donation?.donor?.gender)),
      getValue: (row) => row.donation?.donor?.gender,
    },
    {
      key: "eventName",
      label: "Event",
      type: "text",
      operators: ["contains", "equals"],
      options: uniqueOptions(rows.map((row) => row.donation?.event?.eventName)),
      getValue: (row) => row.donation?.event?.eventName,
    },
    {
      key: "employeeName",
      label: "Donation Owner",
      type: "text",
      operators: ["contains", "equals"],
      options: uniqueOptions(rows.map((row) => row.donation?.employee?.name)),
      getValue: (row) => row.donation?.employee?.name,
    },
  ];
}

function eventsAttributes(rows) {
  return [
    {
      key: "type",
      label: "Event Type",
      type: "enum",
      operators: ["equals", "in"],
      options: uniqueOptions(rows.map((row) => row.type)),
      getValue: (row) => row.type,
    },
    {
      key: "startDate",
      label: "Start Date",
      type: "date",
      operators: ["before", "after", "between"],
      getValue: (row) => row.startDate,
    },
    {
      key: "city",
      label: "City",
      type: "text",
      operators: ["contains", "equals"],
      options: uniqueOptions(rows.map((row) => row.city)),
      getValue: (row) => row.city,
    },
    {
      key: "isActive",
      label: "Is Active",
      type: "boolean",
      operators: ["equals"],
      options: [
        { label: "Yes", value: "true" },
        { label: "No", value: "false" },
      ],
      getValue: (row) => row.isActive,
    },
    {
      key: "employeeName",
      label: "Owner",
      type: "text",
      operators: ["contains", "equals"],
      options: uniqueOptions(rows.map((row) => row.employee?.name)),
      getValue: (row) => row.employee?.name,
    },
    {
      key: "donationsCount",
      label: "Donations Count",
      type: "count",
      operators: ["eq", "gt", "gte", "lt", "between"],
      getValue: (row) => relationCount(row, "donations"),
    },
    {
      key: "assignmentsCount",
      label: "Assignments Count",
      type: "count",
      operators: ["eq", "gt", "gte", "lt", "between"],
      getValue: (row) => relationCount(row, "assignments"),
    },
    {
      key: "promotionsCount",
      label: "Promotion Count",
      type: "count",
      operators: ["eq", "gt", "gte", "lt", "between"],
      getValue: (row) => relationCount(row, "promotions"),
    },
  ];
}

function invoicesAttributes(rows) {
  return [
    {
      key: "status",
      label: "Invoice Status",
      type: "enum",
      operators: ["equals", "in"],
      options: uniqueOptions(rows.map((row) => row.status)),
      getValue: (row) => row.status,
    },
    {
      key: "invoiceDate",
      label: "Invoice Date",
      type: "date",
      operators: ["before", "after", "between"],
      getValue: (row) => row.invoiceDate,
    },
    {
      key: "dueDate",
      label: "Due Date",
      type: "date",
      operators: ["before", "after", "between"],
      getValue: (row) => row.dueDate,
    },
    {
      key: "totalAmount",
      label: "Total Amount",
      type: "number",
      operators: ["eq", "gt", "gte", "lt", "between"],
      getValue: (row) => row.totalAmount,
    },
    {
      key: "vendorName",
      label: "Vendor",
      type: "text",
      operators: ["contains", "equals"],
      options: uniqueOptions(rows.map((row) => row.vendor?.name)),
      getValue: (row) => row.vendor?.name,
    },
    {
      key: "payableStatus",
      label: "Payable Status",
      type: "enum",
      operators: ["equals", "in"],
      options: uniqueOptions(rows.map((row) => row.payable?.status)),
      getValue: (row) => row.payable?.status,
    },
    {
      key: "itemsCount",
      label: "Invoice Items Count",
      type: "count",
      operators: ["eq", "gt", "gte", "lt", "between"],
      getValue: (row) => relationCount(row, "items"),
    },
  ];
}

function employeesAttributes(rows) {
  return [
    {
      key: "gender",
      label: "Gender",
      type: "enum",
      operators: ["equals", "in"],
      options: uniqueOptions(rows.map((row) => row.gender)),
      getValue: (row) => row.gender,
    },
    {
      key: "role",
      label: "Role",
      type: "enum",
      operators: ["equals", "in"],
      options: uniqueOptions(rows.map((row) => row.role)),
      getValue: (row) => row.role,
    },
    {
      key: "maritalStatus",
      label: "Marital Status",
      type: "enum",
      operators: ["equals", "in"],
      options: uniqueOptions(rows.map((row) => row.maritalStatus)),
      getValue: (row) => row.maritalStatus,
    },
    {
      key: "status",
      label: "Status",
      type: "enum",
      operators: ["equals", "in"],
      options: uniqueOptions(rows.map((row) => row.status)),
      getValue: (row) => row.status,
    },
    {
      key: "position",
      label: "Position",
      type: "text",
      operators: ["contains", "equals"],
      options: uniqueOptions(rows.map((row) => row.position)),
      getValue: (row) => row.position,
    },
    {
      key: "age",
      label: "Age",
      type: "number",
      operators: ["eq", "gt", "gte", "lt", "between"],
      getValue: (row) => calculateAge(row.birthday),
    },
    {
      key: "schedulesCount",
      label: "Schedules Count",
      type: "count",
      operators: ["eq", "gt", "gte", "lt", "between"],
      getValue: (row) => relationCount(row, "schedules"),
    },
    {
      key: "eventsCount",
      label: "Events Count",
      type: "count",
      operators: ["eq", "gt", "gte", "lt", "between"],
      getValue: (row) => relationCount(row, "events"),
    },
  ];
}

function schedulesAttributes(rows) {
  return [
    {
      key: "status",
      label: "Status",
      type: "enum",
      operators: ["equals", "in"],
      options: uniqueOptions(rows.map((row) => row.status)),
      getValue: (row) => row.status,
    },
    {
      key: "shiftDate",
      label: "Shift Date",
      type: "date",
      operators: ["before", "after", "between"],
      getValue: (row) => row.shiftDate,
    },
    {
      key: "employeeName",
      label: "Employee",
      type: "text",
      operators: ["contains", "equals"],
      options: uniqueOptions(rows.map((row) => row.employee?.name)),
      getValue: (row) => row.employee?.name,
    },
    {
      key: "eventName",
      label: "Event",
      type: "text",
      operators: ["contains", "equals"],
      options: uniqueOptions(rows.map((row) => row.event?.eventName)),
      getValue: (row) => row.event?.eventName,
    },
  ];
}

function kitsAttributes(rows) {
  return [
    {
      key: "isActive",
      label: "Active",
      type: "boolean",
      operators: ["equals"],
      options: [{ label: "Yes", value: "true" }, { label: "No", value: "false" }],
      getValue: (row) => row.isActive,
    },
    {
      key: "componentsCount",
      label: "Components Count",
      type: "count",
      operators: ["eq", "gt", "gte", "lt", "between"],
      getValue: (row) => relationCount(row, "components"),
    },
    {
      key: "donationsCount",
      label: "Assigned Donations",
      type: "count",
      operators: ["eq", "gt", "gte", "lt", "between"],
      getValue: (row) => relationCount(row, "donations"),
    },
  ];
}

function booksAttributes(rows) {
  return [
    {
      key: "format",
      label: "Format",
      type: "text",
      operators: ["contains", "equals"],
      options: uniqueOptions(rows.map((row) => row.bookFormat?.formatType)),
      getValue: (row) => row.bookFormat?.formatType,
    },
    {
      key: "language",
      label: "Language",
      type: "text",
      operators: ["contains", "equals"],
      options: uniqueOptions(rows.map((row) => row.bookFormat?.language)),
      getValue: (row) => row.bookFormat?.language,
    },
    {
      key: "currentStock",
      label: "Current Stock",
      type: "number",
      operators: ["eq", "gt", "gte", "lt", "between"],
      getValue: (row) => row.currentStock,
    },
    {
      key: "reorderLevel",
      label: "Reorder Level",
      type: "number",
      operators: ["eq", "gt", "gte", "lt", "between"],
      getValue: (row) => row.reorderLevel,
    },
    {
      key: "unitCost",
      label: "Unit Cost",
      type: "number",
      operators: ["eq", "gt", "gte", "lt", "between"],
      getValue: (row) => row.unitCost,
    },
  ];
}

function stockAttributes(rows, typeLabelKey = null) {
  const attributes = [
    {
      key: "currentStock",
      label: "Current Stock",
      type: "number",
      operators: ["eq", "gt", "gte", "lt", "between"],
      getValue: (row) => row.currentStock,
    },
    {
      key: "reorderLevel",
      label: "Reorder Level",
      type: "number",
      operators: ["eq", "gt", "gte", "lt", "between"],
      getValue: (row) => row.reorderLevel,
    },
    {
      key: "unitCost",
      label: "Unit Cost",
      type: "number",
      operators: ["eq", "gt", "gte", "lt", "between"],
      getValue: (row) => row.unitCost,
    },
    {
      key: "isActive",
      label: "Active",
      type: "boolean",
      operators: ["equals"],
      options: [{ label: "Yes", value: "true" }, { label: "No", value: "false" }],
      getValue: (row) => row.isActive,
    },
  ];

  if (typeLabelKey) {
    attributes.unshift({
      key: typeLabelKey,
      label: "Type",
      type: "text",
      operators: ["contains", "equals"],
      options: uniqueOptions(rows.map((row) => row[typeLabelKey])),
      getValue: (row) => row[typeLabelKey],
    });
  }

  return attributes;
}

function promotionAssetsAttributes(rows) {
  return [
    {
      key: "assetCategory",
      label: "Category",
      type: "enum",
      operators: ["equals", "in"],
      options: uniqueOptions(rows.map((row) => row.assetCategory)),
      getValue: (row) => row.assetCategory,
    },
    {
      key: "assetType",
      label: "Asset Type",
      type: "enum",
      operators: ["equals", "in"],
      options: uniqueOptions(rows.map((row) => row.assetType)),
      getValue: (row) => row.assetType,
    },
    {
      key: "isActive",
      label: "Active",
      type: "boolean",
      operators: ["equals"],
      options: [{ label: "Yes", value: "true" }, { label: "No", value: "false" }],
      getValue: (row) => row.isActive,
    },
  ];
}

function vendorsAttributes(rows) {
  return [
    {
      key: "isActive",
      label: "Active",
      type: "boolean",
      operators: ["equals"],
      options: [{ label: "Yes", value: "true" }, { label: "No", value: "false" }],
      getValue: (row) => row.isActive,
    },
    {
      key: "supplyType",
      label: "Supply Type",
      type: "text",
      operators: ["contains", "equals"],
      options: uniqueOptions(rows.map((row) => row.supplyType)),
      getValue: (row) => row.supplyType,
    },
    {
      key: "rating",
      label: "Rating",
      type: "number",
      operators: ["eq", "gt", "gte", "lt", "between"],
      getValue: (row) => row.rating,
    },
    {
      key: "invoicesCount",
      label: "Invoices Count",
      type: "count",
      operators: ["eq", "gt", "gte", "lt", "between"],
      getValue: (row) => relationCount(row, "invoices"),
    },
  ];
}

function payablesAttributes(rows) {
  return [
    {
      key: "status",
      label: "Payable Status",
      type: "enum",
      operators: ["equals", "in"],
      options: uniqueOptions(rows.map((row) => row.status)),
      getValue: (row) => row.status,
    },
    {
      key: "remainingAmount",
      label: "Remaining Amount",
      type: "number",
      operators: ["eq", "gt", "gte", "lt", "between"],
      getValue: (row) => row.remainingAmount,
    },
    {
      key: "dueDate",
      label: "Due Date",
      type: "date",
      operators: ["before", "after", "between"],
      getValue: (row) => row.dueDate,
    },
    {
      key: "invoiceStatus",
      label: "Invoice Status",
      type: "enum",
      operators: ["equals", "in"],
      options: uniqueOptions(rows.map((row) => row.invoice?.status)),
      getValue: (row) => row.invoice?.status,
    },
    {
      key: "paymentsCount",
      label: "Payments Count",
      type: "count",
      operators: ["eq", "gt", "gte", "lt", "between"],
      getValue: (row) => relationCount(row, "payments"),
    },
  ];
}

function paymentsAttributes(rows) {
  return [
    {
      key: "paymentMethod",
      label: "Payment Method",
      type: "enum",
      operators: ["equals", "in"],
      options: uniqueOptions(rows.map((row) => row.paymentMethod)),
      getValue: (row) => row.paymentMethod,
    },
    {
      key: "paymentDate",
      label: "Payment Date",
      type: "date",
      operators: ["before", "after", "between"],
      getValue: (row) => row.paymentDate,
    },
    {
      key: "amount",
      label: "Amount",
      type: "number",
      operators: ["eq", "gt", "gte", "lt", "between"],
      getValue: (row) => row.amount,
    },
    {
      key: "vendorName",
      label: "Vendor",
      type: "text",
      operators: ["contains", "equals"],
      options: uniqueOptions(rows.map((row) => row.payable?.invoice?.vendor?.name)),
      getValue: (row) => row.payable?.invoice?.vendor?.name,
    },
  ];
}

const moduleDefinitions = {
  employees: {
    label: "Employees",
    async fetchRows() {
      return prisma.employee.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          schedules: { select: { id: true } },
          events: { select: { id: true } },
        },
      });
    },
    attributes: employeesAttributes,
    buildCharts(rows) {
      return [
        { key: "role", title: "Role distribution", kind: "bar", data: groupCounts(rows, (row) => row.role, { formatter: humanizeEnum }) },
        { key: "status", title: "Employee status", kind: "bar", data: groupCounts(rows, (row) => row.status, { formatter: humanizeEnum }) },
        { key: "age-groups", title: "Age groups", kind: "bar", data: bucketAges(rows, (row) => calculateAge(row.birthday)) },
      ];
    },
  },
  schedules: {
    label: "Schedules",
    async fetchRows() {
      return prisma.schedule.findMany({
        orderBy: [{ shiftDate: "desc" }, { startTime: "asc" }],
        include: {
          employee: true,
          event: true,
        },
      });
    },
    attributes: schedulesAttributes,
    buildCharts(rows) {
      return [
        { key: "status", title: "Schedule status", kind: "bar", data: groupCounts(rows, (row) => row.status, { formatter: humanizeEnum }) },
        { key: "employee", title: "Shifts by employee", kind: "bar", data: groupCounts(rows, (row) => row.employee?.name || "Unknown") },
        { key: "schedule-trend", title: "Shifts by month", kind: "line", data: groupByMonth(rows, (row) => row.shiftDate) },
      ];
    },
  },
  donors: {
    label: "Donors",
    async fetchRows() {
      return prisma.donor.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          sourceEvent: true,
          donations: {
            include: {
              feedbacks: {
                select: { id: true },
              },
            },
          },
        },
      });
    },
    attributes: donorsAttributes,
    buildCharts(rows) {
      return [
        { key: "gender", title: "Gender distribution", kind: "bar", data: groupCounts(rows, (row) => row.gender, { formatter: humanizeEnum }) },
        { key: "age-groups", title: "Age group distribution", kind: "bar", data: bucketAges(rows, (row) => calculateAge(row.birthday)) },
        { key: "cities", title: "Top cities", kind: "bar", data: groupCounts(rows, (row) => row.city || row.country) },
      ];
    },
  },
  donations: {
    label: "Donations",
    async fetchRows() {
      return prisma.donationReceivable.findMany({
        orderBy: { donationDate: "desc" },
        include: {
          donor: true,
          event: true,
          donationKit: true,
          employee: true,
          receipts: { select: { id: true } },
          shippings: { select: { id: true } },
          feedbacks: { select: { id: true } },
        },
      });
    },
    attributes: donationsAttributes,
    buildCharts(rows) {
      return [
        { key: "status", title: "Donation status", kind: "bar", data: groupCounts(rows, (row) => row.status, { formatter: humanizeEnum }) },
        { key: "frequency", title: "Donation frequency", kind: "bar", data: groupCounts(rows, (row) => row.donationFrequency, { formatter: humanizeEnum }) },
        { key: "trend", title: "Donations by month", kind: "line", data: groupByMonth(rows, (row) => row.donationDate) },
      ];
    },
  },
  receipts: {
    label: "Receipts",
    async fetchRows() {
      return prisma.donationReceipt.findMany({
        orderBy: { receiptDate: "desc" },
        include: {
          donation: {
            include: {
              donor: true,
              event: true,
              employee: true,
            },
          },
        },
      });
    },
    attributes: receiptsAttributes,
    buildCharts(rows) {
      return [
        { key: "status", title: "Receipt status", kind: "bar", data: groupCounts(rows, (row) => row.status, { formatter: humanizeEnum }) },
        { key: "payment-method", title: "Payment method mix", kind: "bar", data: groupCounts(rows, (row) => row.paymentMethod, { formatter: humanizeEnum }) },
        { key: "receipt-trend", title: "Receipts by month", kind: "line", data: groupByMonth(rows, (row) => row.receiptDate) },
      ];
    },
  },
  shipping: {
    label: "Shipping",
    async fetchRows() {
      return prisma.shipping.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          donation: {
            include: {
              donor: true,
              event: true,
              employee: true,
            },
          },
        },
      });
    },
    attributes: shippingAttributes,
    buildCharts(rows) {
      return [
        { key: "status", title: "Shipping status", kind: "bar", data: groupCounts(rows, (row) => row.status, { formatter: humanizeEnum }) },
        { key: "carrier", title: "Carrier distribution", kind: "bar", data: groupCounts(rows, (row) => row.carrier || "Unassigned") },
        { key: "ship-trend", title: "Shipments by month", kind: "line", data: groupByMonth(rows, (row) => row.shippedDate || row.createdAt) },
      ];
    },
  },
  feedback: {
    label: "Feedback",
    async fetchRows() {
      return prisma.feedback.findMany({
        orderBy: { feedbackDate: "desc" },
        include: {
          donation: {
            include: {
              donor: true,
              event: true,
              employee: true,
            },
          },
        },
      });
    },
    attributes: feedbackAttributes,
    buildCharts(rows) {
      return [
        { key: "status", title: "Feedback status", kind: "bar", data: groupCounts(rows, (row) => row.status, { formatter: humanizeEnum }) },
        { key: "rating", title: "Rating distribution", kind: "bar", data: groupCounts(rows, (row) => row.rating || "Unrated") },
        { key: "feedback-trend", title: "Feedback by month", kind: "line", data: groupByMonth(rows, (row) => row.feedbackDate) },
      ];
    },
  },
  "donation-kits": {
    label: "Donation Kits",
    async fetchRows() {
      return prisma.donationKit.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          components: { select: { id: true } },
          donations: { select: { id: true } },
        },
      });
    },
    attributes: kitsAttributes,
    buildCharts(rows) {
      return [
        { key: "active", title: "Kit activation", kind: "bar", data: groupCounts(rows, (row) => (row.isActive ? "ACTIVE" : "INACTIVE"), { formatter: humanizeEnum }) },
        { key: "components", title: "Components per kit", kind: "bar", data: rows.map((row) => ({ label: row.kitName, value: relationCount(row, "components") })).slice(0, 8) },
      ];
    },
  },
  books: {
    label: "Books",
    async fetchRows() {
      return prisma.book.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          press: true,
          bookSeries: true,
          bookFormat: true,
        },
      });
    },
    attributes: booksAttributes,
    buildCharts(rows) {
      return [
        { key: "format", title: "Book formats", kind: "bar", data: groupCounts(rows, (row) => row.bookFormat?.formatType || "Unknown") },
        { key: "stock", title: "Stock by title", kind: "bar", data: rows.map((row) => ({ label: row.title, value: Number(row.currentStock || 0) })).slice(0, 8) },
      ];
    },
  },
  envelopes: {
    label: "Envelopes",
    async fetchRows() {
      return prisma.envelope.findMany({ orderBy: { createdAt: "desc" } });
    },
    attributes: (rows) => stockAttributes(rows),
    buildCharts(rows) {
      return [
        { key: "stock", title: "Envelope stock", kind: "bar", data: rows.map((row) => ({ label: row.envelopeCode, value: Number(row.currentStock || 0) })).slice(0, 8) },
        { key: "active", title: "Envelope activity", kind: "bar", data: groupCounts(rows, (row) => (row.isActive ? "ACTIVE" : "INACTIVE"), { formatter: humanizeEnum }) },
      ];
    },
  },
  boxes: {
    label: "Boxes",
    async fetchRows() {
      return prisma.box.findMany({ orderBy: { createdAt: "desc" } });
    },
    attributes: (rows) => stockAttributes(rows),
    buildCharts(rows) {
      return [
        { key: "stock", title: "Box stock", kind: "bar", data: rows.map((row) => ({ label: row.boxCode, value: Number(row.currentStock || 0) })).slice(0, 8) },
        { key: "active", title: "Box activity", kind: "bar", data: groupCounts(rows, (row) => (row.isActive ? "ACTIVE" : "INACTIVE"), { formatter: humanizeEnum }) },
      ];
    },
  },
  "promotion-inventory": {
    label: "Promotion Inventory",
    async fetchRows() {
      return prisma.promotionInventory.findMany({ orderBy: { createdAt: "desc" } });
    },
    attributes: (rows) => stockAttributes(rows, "promotionInventoryType"),
    buildCharts(rows) {
      return [
        { key: "type", title: "Promotion inventory types", kind: "bar", data: groupCounts(rows, (row) => row.promotionInventoryType) },
        { key: "stock", title: "Promotion inventory stock", kind: "bar", data: rows.map((row) => ({ label: row.inventoryCode, value: Number(row.currentStock || 0) })).slice(0, 8) },
      ];
    },
  },
  events: {
    label: "Events",
    async fetchRows() {
      return prisma.event.findMany({
        orderBy: { startDate: "desc" },
        include: {
          employee: true,
          donations: { select: { id: true } },
          assignments: { select: { id: true } },
          promotions: { select: { id: true } },
        },
      });
    },
    attributes: eventsAttributes,
    buildCharts(rows) {
      return [
        { key: "type", title: "Event type distribution", kind: "bar", data: groupCounts(rows, (row) => row.type, { formatter: humanizeEnum }) },
        {
          key: "donations-per-event",
          title: "Donations per event",
          kind: "bar",
          data: rows
            .map((row) => ({ label: row.eventName, value: relationCount(row, "donations") }))
            .sort((left, right) => right.value - left.value)
            .slice(0, 8),
        },
        { key: "events-trend", title: "Events by month", kind: "line", data: groupByMonth(rows, (row) => row.startDate) },
      ];
    },
  },
  "promotion-assets": {
    label: "Promotion Assets",
    async fetchRows() {
      return prisma.promotionAsset.findMany({ orderBy: { createdAt: "desc" } });
    },
    attributes: promotionAssetsAttributes,
    buildCharts(rows) {
      return [
        { key: "category", title: "Asset categories", kind: "bar", data: groupCounts(rows, (row) => row.assetCategory, { formatter: humanizeEnum }) },
        { key: "type", title: "Asset types", kind: "bar", data: groupCounts(rows, (row) => row.assetType, { formatter: humanizeEnum }) },
      ];
    },
  },
  vendors: {
    label: "Vendors",
    async fetchRows() {
      return prisma.vendor.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          invoices: { select: { id: true } },
        },
      });
    },
    attributes: vendorsAttributes,
    buildCharts(rows) {
      return [
        { key: "active", title: "Vendor activity", kind: "bar", data: groupCounts(rows, (row) => (row.isActive ? "ACTIVE" : "INACTIVE"), { formatter: humanizeEnum }) },
        { key: "supply", title: "Supply types", kind: "bar", data: groupCounts(rows, (row) => row.supplyType || "Unknown") },
        { key: "rating", title: "Rating distribution", kind: "bar", data: groupCounts(rows, (row) => row.rating || "Unrated") },
      ];
    },
  },
  invoices: {
    label: "Invoices",
    async fetchRows() {
      return prisma.invoice.findMany({
        orderBy: { invoiceDate: "desc" },
        include: {
          vendor: true,
          employee: true,
          items: true,
          payable: true,
        },
      });
    },
    attributes: invoicesAttributes,
    buildCharts(rows) {
      return [
        { key: "status", title: "Invoice status", kind: "bar", data: groupCounts(rows, (row) => row.status, { formatter: humanizeEnum }) },
        { key: "payable-status", title: "Payable status", kind: "bar", data: groupCounts(rows, (row) => row.payable?.status || "No payable", { formatter: humanizeEnum }) },
        { key: "invoice-trend", title: "Invoices by month", kind: "line", data: groupByMonth(rows, (row) => row.invoiceDate) },
      ];
    },
  },
  payables: {
    label: "Payables",
    async fetchRows() {
      return prisma.payable.findMany({
        orderBy: { dueDate: "desc" },
        include: {
          invoice: {
            include: {
              vendor: true,
            },
          },
          payments: { select: { id: true } },
        },
      });
    },
    attributes: payablesAttributes,
    buildCharts(rows) {
      return [
        { key: "status", title: "Payable status", kind: "bar", data: groupCounts(rows, (row) => row.status, { formatter: humanizeEnum }) },
        { key: "payments", title: "Payments per payable", kind: "bar", data: rows.map((row) => ({ label: row.invoice?.invoiceNumber || `Payable ${row.id}`, value: relationCount(row, "payments") })).slice(0, 8) },
        { key: "due-trend", title: "Payables by due month", kind: "line", data: groupByMonth(rows, (row) => row.dueDate) },
      ];
    },
  },
  payments: {
    label: "Payments",
    async fetchRows() {
      return prisma.invoicePayment.findMany({
        orderBy: { paymentDate: "desc" },
        include: {
          payable: {
            include: {
              invoice: {
                include: {
                  vendor: true,
                },
              },
            },
          },
        },
      });
    },
    attributes: paymentsAttributes,
    buildCharts(rows) {
      return [
        { key: "method", title: "Payment methods", kind: "bar", data: groupCounts(rows, (row) => row.paymentMethod, { formatter: humanizeEnum }) },
        { key: "vendors", title: "Payments by vendor", kind: "bar", data: groupCounts(rows, (row) => row.payable?.invoice?.vendor?.name || "Unknown") },
        { key: "payment-trend", title: "Payments by month", kind: "line", data: groupByMonth(rows, (row) => row.paymentDate) },
      ];
    },
  },
};

function getModuleDefinition(moduleKey) {
  const moduleDefinition = moduleDefinitions[moduleKey];

  if (!moduleDefinition) {
    const error = new Error("Analytics module not configured.");
    error.statusCode = 404;
    throw error;
  }

  return moduleDefinition;
}

async function getMetadata(moduleKey) {
  const moduleDefinition = getModuleDefinition(moduleKey);
  const rows = await moduleDefinition.fetchRows();
  const attributes = moduleDefinition.attributes(rows);

  return {
    moduleKey,
    label: moduleDefinition.label,
    attributes: normalizeMetadataAttributes(attributes),
  };
}

async function query(moduleKey, filters = []) {
  const moduleDefinition = getModuleDefinition(moduleKey);
  const rows = await moduleDefinition.fetchRows();
  const attributes = moduleDefinition.attributes(rows);
  const attributesMap = Object.fromEntries(attributes.map((attribute) => [attribute.key, attribute]));
  const activeFilters = filters.filter((filter) => {
    const attribute = attributesMap[filter.attribute];

    if (!attribute || !filter.operator) {
      return false;
    }

    if (filter.operator === "between") {
      return filter.value !== undefined && filter.value !== "" && filter.valueTo !== undefined && filter.valueTo !== "";
    }

    if (attribute.type === "boolean") {
      return filter.value !== undefined && filter.value !== "";
    }

    return filter.value !== undefined && filter.value !== "";
  });

  const filteredItems = rows.filter((row) =>
    activeFilters.every((filter) => matchesFilter(row, attributesMap[filter.attribute], filter)),
  );

  return {
    items: filteredItems,
    summary: {
      filteredTotal: filteredItems.length,
      sourceTotal: rows.length,
      activeFilters: activeFilters.length,
      availableAttributes: attributes.length,
    },
    charts: moduleDefinition.buildCharts(filteredItems),
  };
}

module.exports = { getMetadata, query };
