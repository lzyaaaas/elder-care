import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mysql from "mysql2/promise";

const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,OPTIONS",
  "access-control-allow-headers": "Content-Type, Authorization",
};

const genderValues = new Set(["FEMALE", "MALE", "NON_BINARY", "PREFER_NOT_TO_SAY"]);
const maritalStatusValues = new Set(["SINGLE", "MARRIED", "PREFER_NOT_TO_SAY"]);
const donationFrequencyValues = new Set(["ONE_TIME", "MONTHLY"]);

function json(data, init = {}) {
  return new Response(JSON.stringify(data, null, 2), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...corsHeaders,
      ...(init.headers || {}),
    },
  });
}

function success({ message = "OK", data = null, status = 200 } = {}) {
  return json(
    {
      success: true,
      message,
      data,
    },
    { status },
  );
}

function failure(message, status = 400, extra = {}) {
  return json(
    {
      success: false,
      message,
      ...extra,
    },
    { status },
  );
}

function normalizeNullableString(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  return String(value).trim();
}

function normalizeDate(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString().slice(0, 10);
}

function generateCode(prefix) {
  const stamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${stamp}-${random}`;
}

function signToken(payload, env) {
  return jwt.sign(payload, env.JWT_SECRET || "worker-dev-secret", {
    expiresIn: "7d",
  });
}

function toEmployeeAuthUser(employee) {
  return {
    accountType: employee.role === "ADMIN" ? "ADMIN" : "EMPLOYEE",
    id: employee.id,
    employeeCode: employee.employee_code,
    name: employee.name,
    email: employee.email,
    role: employee.role,
    status: employee.status,
  };
}

function toDonorAuthUser(donor) {
  return {
    id: donor.id,
    donorCode: donor.donor_code,
    name: `${donor.first_name} ${donor.last_name}`,
    email: donor.email,
    supporterType: donor.supporter_type,
    accountStatus: donor.account_status,
  };
}

async function connect(env) {
  return mysql.createConnection({
    host: env.HYPERDRIVE.host,
    port: env.HYPERDRIVE.port,
    user: env.HYPERDRIVE.user,
    password: env.HYPERDRIVE.password,
    database: env.HYPERDRIVE.database,
    disableEval: true,
  });
}

async function readBody(request) {
  try {
    return await request.json();
  } catch (_error) {
    throw Object.assign(new Error("Request body must be valid JSON."), {
      statusCode: 400,
    });
  }
}

function requireNonEmptyString(value, label, { email = false, min = 1 } = {}) {
  if (typeof value !== "string" || value.trim().length < min) {
    throw Object.assign(new Error(`${label} is required.`), {
      statusCode: 400,
    });
  }

  const normalized = value.trim();

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    throw Object.assign(new Error(`${label} must be a valid email address.`), {
      statusCode: 400,
    });
  }

  return normalized;
}

function requirePositiveNumber(value, label) {
  const number = Number(value);

  if (!Number.isFinite(number) || number <= 0) {
    throw Object.assign(new Error(`${label} must be greater than 0.`), {
      statusCode: 400,
    });
  }

  return number;
}

function requireNonNegativeNumber(value, label) {
  const number = Number(value);

  if (!Number.isFinite(number) || number < 0) {
    throw Object.assign(new Error(`${label} must be 0 or greater.`), {
      statusCode: 400,
    });
  }

  return number;
}

function optionalEnum(value, values, label) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (!values.has(value)) {
    throw Object.assign(new Error(`${label} is invalid.`), {
      statusCode: 400,
    });
  }

  return value;
}

function optionalPositiveNumber(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  return requirePositiveNumber(value, "Value");
}

function getAuthToken(request) {
  const header = request.headers.get("authorization") || "";

  if (!header.startsWith("Bearer ")) {
    return null;
  }

  return header.slice("Bearer ".length).trim();
}

async function getSingleCount(connection, tableName) {
  const [rows] = await connection.query(`SELECT COUNT(*) AS total FROM \`${tableName}\`;`);
  return rows?.[0]?.total ?? 0;
}

async function listPublicEvents(env) {
  const connection = await connect(env);

  try {
    const [rows] = await connection.query(
      `SELECT id, event_name AS eventName, start_date AS startDate, city, country, type
       FROM events
       WHERE is_active = 1
       ORDER BY start_date ASC`,
    );

    return success({
      message: "Public events retrieved.",
      data: rows,
    });
  } finally {
    await connection.end();
  }
}

async function loginEmployee(request, env) {
  const body = await readBody(request);
  const email = requireNonEmptyString(body.email, "Email", { email: true });
  const password = requireNonEmptyString(body.password, "Password", { min: 6 });
  const connection = await connect(env);

  try {
    const [rows] = await connection.query(
      `SELECT id, employee_code, name, email, password_hash, role, status
       FROM employees
       WHERE email = ?
       LIMIT 1`,
      [email],
    );

    const employee = rows?.[0];

    if (!employee || !employee.password_hash) {
      return failure("Invalid email or password.", 401);
    }

    if (employee.status !== "ACTIVE") {
      return failure("This account is inactive.", 403);
    }

    const isValidPassword = await bcrypt.compare(password, employee.password_hash);

    if (!isValidPassword) {
      return failure("Invalid email or password.", 401);
    }

    const user = toEmployeeAuthUser(employee);
    const token = signToken(user, env);

    return success({
      message: "Login successful.",
      data: { token, user },
    });
  } finally {
    await connection.end();
  }
}

async function registerDonor(request, env) {
  const body = await readBody(request);
  const firstName = requireNonEmptyString(body.firstName, "First name");
  const lastName = requireNonEmptyString(body.lastName, "Last name");
  const email = requireNonEmptyString(body.email, "Email", { email: true });
  const password = requireNonEmptyString(body.password, "Password", { min: 6 });
  const country = requireNonEmptyString(body.country, "Country");
  const birthday = normalizeDate(body.birthday);
  const gender = optionalEnum(body.gender, genderValues, "Gender");
  optionalEnum(body.maritalStatus, maritalStatusValues, "Marital status");
  const phone = normalizeNullableString(body.phone);
  const state = normalizeNullableString(body.state);
  const city = normalizeNullableString(body.city);
  const preferredLanguage = normalizeNullableString(body.preferredLanguage);
  const sourceEventId = optionalPositiveNumber(body.sourceEventId);
  const passwordHash = await bcrypt.hash(password, 10);
  const connection = await connect(env);

  try {
    await connection.beginTransaction();

    const [existingRows] = await connection.query(
      `SELECT d.*,
              (SELECT COUNT(*) FROM donation_receivables dr WHERE dr.donor_id = d.id) AS donations_count
       FROM donors d
       WHERE d.email = ?
       LIMIT 1`,
      [email],
    );

    const existingDonor = existingRows?.[0] || null;

    if (existingDonor?.password_hash) {
      await connection.rollback();
      return failure("An account already exists for this email.", 409);
    }

    let donorId = existingDonor?.id ?? null;

    if (existingDonor) {
      await connection.query(
        `UPDATE donors
         SET first_name = ?,
             last_name = ?,
             birthday = ?,
             gender = ?,
             phone = ?,
             country = ?,
             state = ?,
             city = ?,
             preferred_language = ?,
             password_hash = ?,
             account_status = 'ACTIVE',
             supporter_type = ?,
             source_event_id = COALESCE(?, source_event_id),
             last_login_at = NOW()
         WHERE id = ?`,
        [
          firstName,
          lastName,
          birthday,
          gender,
          phone,
          country,
          state,
          city,
          preferredLanguage,
          passwordHash,
          Number(existingDonor.donations_count) > 0 ? "DONOR" : "SUPPORTER",
          sourceEventId,
          existingDonor.id,
        ],
      );
    } else {
      const [result] = await connection.query(
        `INSERT INTO donors (
          donor_code, first_name, last_name, birthday, gender, country, state, city,
          email, phone, preferred_language, password_hash, account_status, supporter_type,
          source_event_id, last_login_at, registration_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', 'SUPPORTER', ?, NOW(), CURRENT_DATE())`,
        [
          generateCode("DON"),
          firstName,
          lastName,
          birthday,
          gender,
          country,
          state,
          city,
          email,
          phone,
          preferredLanguage,
          passwordHash,
          sourceEventId,
        ],
      );

      donorId = result.insertId;
    }

    const [donorRows] = await connection.query(
      `SELECT id, donor_code, first_name, last_name, email, supporter_type, account_status
       FROM donors
       WHERE id = ?
       LIMIT 1`,
      [donorId],
    );

    await connection.commit();

    const donor = donorRows?.[0];
    const user = toDonorAuthUser(donor);
    const token = signToken({ accountType: "DONOR", ...user }, env);

    return success({
      status: 201,
      message: "Donor account created.",
      data: { token, user },
    });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    await connection.end();
  }
}

async function loginDonor(request, env) {
  const body = await readBody(request);
  const email = requireNonEmptyString(body.email, "Email", { email: true });
  const password = requireNonEmptyString(body.password, "Password", { min: 1 });
  const connection = await connect(env);

  try {
    const [rows] = await connection.query(
      `SELECT id, donor_code, first_name, last_name, email, password_hash, supporter_type, account_status
       FROM donors
       WHERE email = ?
       LIMIT 1`,
      [email],
    );

    const donor = rows?.[0];

    if (!donor || !donor.password_hash) {
      return failure("Invalid email or password.", 401);
    }

    if (donor.account_status !== "ACTIVE") {
      return failure("This donor account is inactive.", 403);
    }

    const isValidPassword = await bcrypt.compare(password, donor.password_hash);

    if (!isValidPassword) {
      return failure("Invalid email or password.", 401);
    }

    await connection.query("UPDATE donors SET last_login_at = NOW() WHERE id = ?", [donor.id]);

    const user = toDonorAuthUser(donor);
    const token = signToken({ accountType: "DONOR", ...user }, env);

    return success({
      message: "Donor login successful.",
      data: { token, user },
    });
  } finally {
    await connection.end();
  }
}

async function createDonation(request, env) {
  const body = await readBody(request);
  const firstName = requireNonEmptyString(body.firstName, "First name");
  const lastName = requireNonEmptyString(body.lastName, "Last name");
  const country = requireNonEmptyString(body.country, "Country");
  const donationAmount = requireNonNegativeNumber(body.donationAmount, "Donation amount");
  const donationFrequency = optionalEnum(
    body.donationFrequency || "ONE_TIME",
    donationFrequencyValues,
    "Donation frequency",
  ) || "ONE_TIME";
  const createAccount = Boolean(body.createAccount);
  const email = normalizeNullableString(body.email);
  const password = normalizeNullableString(body.password);
  const birthday = normalizeDate(body.birthday);
  const gender = optionalEnum(body.gender, genderValues, "Gender");
  optionalEnum(body.maritalStatus, maritalStatusValues, "Marital status");
  const phone = normalizeNullableString(body.phone);
  const state = normalizeNullableString(body.state);
  const city = normalizeNullableString(body.city);
  const preferredLanguage = normalizeNullableString(body.preferredLanguage);
  const eventId = optionalPositiveNumber(body.eventId);
  const sourceEventId = optionalPositiveNumber(body.sourceEventId);
  const donationKitId = optionalPositiveNumber(body.donationKitId);
  const notes = normalizeNullableString(body.notes);

  if (createAccount && !email) {
    return failure("Email is required to create a donor account.", 400);
  }

  if (createAccount && !password) {
    return failure("Password is required to create a donor account.", 400);
  }

  const passwordHash = createAccount && password ? await bcrypt.hash(password, 10) : null;
  const connection = await connect(env);

  try {
    await connection.beginTransaction();

    let existingDonor = null;
    if (email) {
      const [existingRows] = await connection.query(
        "SELECT * FROM donors WHERE email = ? LIMIT 1",
        [email],
      );
      existingDonor = existingRows?.[0] || null;
    }

    if (createAccount && existingDonor?.password_hash) {
      await connection.rollback();
      return failure(
        "An account already exists for this email. Please sign in or donate without creating a new account.",
        409,
      );
    }

    let donorId = existingDonor?.id ?? null;

    if (existingDonor) {
      await connection.query(
        `UPDATE donors
         SET first_name = ?,
             last_name = ?,
             birthday = ?,
             gender = ?,
             email = ?,
             phone = ?,
             country = ?,
             state = ?,
             city = ?,
             preferred_language = ?,
             supporter_type = 'DONOR',
             source_event_id = ?,
             password_hash = COALESCE(?, password_hash),
             account_status = ?,
             last_login_at = ?
         WHERE id = ?`,
        [
          firstName,
          lastName,
          birthday,
          gender,
          email,
          phone,
          country,
          state,
          city,
          preferredLanguage,
          sourceEventId || eventId,
          passwordHash,
          createAccount ? "ACTIVE" : existingDonor.account_status || "INACTIVE",
          createAccount ? new Date() : existingDonor.last_login_at,
          existingDonor.id,
        ],
      );
    } else {
      const [donorResult] = await connection.query(
        `INSERT INTO donors (
          donor_code, first_name, last_name, birthday, gender, country, state, city,
          email, phone, preferred_language, password_hash, account_status, supporter_type,
          source_event_id, last_login_at, registration_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'DONOR', ?, ?, CURRENT_DATE())`,
        [
          generateCode("DON"),
          firstName,
          lastName,
          birthday,
          gender,
          country,
          state,
          city,
          email,
          phone,
          preferredLanguage,
          passwordHash,
          createAccount ? "ACTIVE" : "INACTIVE",
          sourceEventId || eventId,
          createAccount ? new Date() : null,
        ],
      );

      donorId = donorResult.insertId;
    }

    donorId = donorId || existingDonor.id;

    const donationDate = normalizeDate(body.donationDate) || new Date().toISOString().slice(0, 10);
    const [donationResult] = await connection.query(
      `INSERT INTO donation_receivables (
        donation_code, donor_id, event_id, donation_amount, donation_date,
        donation_frequency, status, donation_kit_id, notes
      ) VALUES (?, ?, ?, ?, ?, ?, 'PENDING', ?, ?)`,
      [
        generateCode("DR"),
        donorId,
        eventId,
        donationAmount,
        donationDate,
        donationFrequency,
        donationKitId,
        notes,
      ],
    );

    const [donationRows] = await connection.query(
      `SELECT dr.id, dr.donation_code, dr.donation_amount, dr.donation_date, dr.donation_frequency, dr.status,
              d.id AS donor_id, d.donor_code, d.first_name, d.last_name, d.email
       FROM donation_receivables dr
       JOIN donors d ON d.id = dr.donor_id
       WHERE dr.id = ?
       LIMIT 1`,
      [donationResult.insertId],
    );

    await connection.commit();

    return success({
      status: 201,
      message: "Public donation submitted.",
      data: donationRows?.[0] || null,
    });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    await connection.end();
  }
}

async function createFeedback(request, env) {
  const body = await readBody(request);
  const feedbackContent = requireNonEmptyString(body.feedbackContent, "Feedback content");
  const rating =
    body.rating === undefined || body.rating === null || body.rating === ""
      ? null
      : requirePositiveNumber(body.rating, "Rating");
  const donationId = optionalPositiveNumber(body.donationId);
  const donationCode = normalizeNullableString(body.donationCode);
  const feedbackDate = normalizeDate(body.feedbackDate) || new Date().toISOString().slice(0, 10);
  const connection = await connect(env);

  try {
    let finalDonationId = donationId;

    if (!finalDonationId && donationCode) {
      const [donationRows] = await connection.query(
        "SELECT id FROM donation_receivables WHERE donation_code = ? LIMIT 1",
        [donationCode],
      );

      if (!donationRows?.[0]?.id) {
        return failure("Donation not found.", 404);
      }

      finalDonationId = donationRows[0].id;
    }

    if (!finalDonationId) {
      return failure("donationId or donationCode is required.", 400);
    }

    const safeRating = rating && rating <= 5 ? rating : rating ? 5 : null;
    const [result] = await connection.query(
      `INSERT INTO feedback (
        donation_id, feedback_content, rating, feedback_date, status
      ) VALUES (?, ?, ?, ?, 'NEW')`,
      [finalDonationId, feedbackContent, safeRating, feedbackDate],
    );

    const [rows] = await connection.query("SELECT * FROM feedback WHERE id = ? LIMIT 1", [
      result.insertId,
    ]);

    return success({
      status: 201,
      message: "Feedback submitted.",
      data: rows?.[0] || null,
    });
  } finally {
    await connection.end();
  }
}

async function getDonorsCount(env) {
  const connection = await connect(env);

  try {
    const total = await getSingleCount(connection, "donors");
    return success({
      message: "Donor count retrieved.",
      data: { total },
    });
  } finally {
    await connection.end();
  }
}

async function getDonationsCount(env) {
  const connection = await connect(env);

  try {
    const total = await getSingleCount(connection, "donation_receivables");
    return success({
      message: "Donation count retrieved.",
      data: { total },
    });
  } finally {
    await connection.end();
  }
}

async function getSummary(env) {
  const connection = await connect(env);

  try {
    const [donors, donations, receipts, shippings, feedback, events, invoices, employees] =
      await Promise.all([
        getSingleCount(connection, "donors"),
        getSingleCount(connection, "donation_receivables"),
        getSingleCount(connection, "donation_receipts"),
        getSingleCount(connection, "shippings"),
        getSingleCount(connection, "feedback"),
        getSingleCount(connection, "events"),
        getSingleCount(connection, "invoices"),
        getSingleCount(connection, "employees"),
      ]);

    return success({
      message: "Database summary retrieved.",
      data: {
        donors,
        donations,
        receipts,
        shippings,
        feedback,
        events,
        invoices,
        employees,
      },
    });
  } finally {
    await connection.end();
  }
}

async function getDashboardAnalytics(env) {
  const connection = await connect(env);

  try {
    const [
      [summaryRow],
      genderRows,
      languageRows,
      countryRows,
      shippingRows,
      feedbackRatingRows,
      feedbackStatusRows,
      donationTrendRows,
      eventRows,
      invoiceRows,
      payableRows,
      inventoryRows,
    ] = await Promise.all([
      connection.query(`
        SELECT
          (SELECT COUNT(*) FROM donors) AS totalDonors,
          (SELECT COUNT(*) FROM donation_receivables) AS totalDonations,
          (SELECT COALESCE(SUM(donation_amount), 0) FROM donation_receivables) AS totalDonationValue,
          (SELECT COUNT(*) FROM feedback) AS totalFeedback,
          (SELECT COUNT(*) FROM events) AS totalEvents,
          (SELECT COUNT(*) FROM payables WHERE status IN ('OPEN', 'PARTIALLY_PAID', 'OVERDUE')) AS openPayables,
          (SELECT COUNT(*) FROM invoices) AS totalInvoices,
          (SELECT COALESCE(SUM(remaining_amount), 0) FROM payables WHERE status IN ('OPEN', 'PARTIALLY_PAID', 'OVERDUE')) AS outstandingPayablesAmount,
          (SELECT ROUND(COALESCE(AVG(rating), 0), 1) FROM feedback WHERE rating IS NOT NULL) AS averageFeedbackRating
      `),
      connection.query(`
        SELECT COALESCE(gender, 'UNKNOWN') AS label, COUNT(*) AS value
        FROM donors
        GROUP BY COALESCE(gender, 'UNKNOWN')
        ORDER BY value DESC
      `),
      connection.query(`
        SELECT COALESCE(preferred_language, 'UNKNOWN') AS label, COUNT(*) AS value
        FROM donors
        GROUP BY COALESCE(preferred_language, 'UNKNOWN')
        ORDER BY value DESC
      `),
      connection.query(`
        SELECT COALESCE(country, 'UNKNOWN') AS label, COUNT(*) AS value
        FROM donors
        GROUP BY COALESCE(country, 'UNKNOWN')
        ORDER BY value DESC
      `),
      connection.query(`
        SELECT status AS label, COUNT(*) AS value
        FROM shippings
        GROUP BY status
        ORDER BY value DESC
      `),
      connection.query(`
        SELECT CAST(rating AS CHAR) AS label, COUNT(*) AS value
        FROM feedback
        WHERE rating IS NOT NULL
        GROUP BY rating
        ORDER BY rating DESC
      `),
      connection.query(`
        SELECT status AS label, COUNT(*) AS value
        FROM feedback
        GROUP BY status
        ORDER BY value DESC
      `),
      connection.query(`
        SELECT DATE_FORMAT(donation_date, '%Y-%m') AS month, COALESCE(SUM(donation_amount), 0) AS donationValue
        FROM donation_receivables
        GROUP BY DATE_FORMAT(donation_date, '%Y-%m')
        ORDER BY month ASC
      `),
      connection.query(`
        SELECT
          COUNT(*) AS totalEvents,
          SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) AS activeEvents,
          SUM(CASE WHEN start_date >= NOW() THEN 1 ELSE 0 END) AS upcomingEvents
        FROM events
      `),
      connection.query(`
        SELECT
          COALESCE(SUM(total_amount), 0) AS totalInvoiceAmount
        FROM invoices
      `),
      connection.query(`
        SELECT status AS label, COUNT(*) AS value
        FROM payables
        GROUP BY status
        ORDER BY value DESC
      `),
      connection.query(`
        SELECT code, itemName, currentStock, reorderLevel
        FROM (
          SELECT envelope_code AS code, CONCAT('Envelope ', size) AS itemName, current_stock AS currentStock, reorder_level AS reorderLevel
          FROM envelopes
          UNION ALL
          SELECT box_code AS code, CONCAT('Box ', size) AS itemName, current_stock AS currentStock, reorder_level AS reorderLevel
          FROM boxes
          UNION ALL
          SELECT inventory_code AS code, promotion_inventory_type AS itemName, current_stock AS currentStock, reorder_level AS reorderLevel
          FROM promotion_inventory
          UNION ALL
          SELECT kit_code AS code, kit_name AS itemName, 0 AS currentStock, 0 AS reorderLevel
          FROM donation_kits
        ) inventory_snapshot
        WHERE currentStock <= reorderLevel
        ORDER BY currentStock ASC, reorderLevel DESC
        LIMIT 6
      `),
    ]);

    const summary = summaryRow?.[0] || {
      totalDonors: 0,
      totalDonations: 0,
      totalDonationValue: 0,
      totalFeedback: 0,
      totalEvents: 0,
      openPayables: 0,
      totalInvoices: 0,
      outstandingPayablesAmount: 0,
      averageFeedbackRating: 0,
    };

    const eventSummaryRow = eventRows?.[0]?.[0] || {
      totalEvents: 0,
      activeEvents: 0,
      upcomingEvents: 0,
    };

    const financeInvoiceRow = invoiceRows?.[0]?.[0] || {
      totalInvoiceAmount: 0,
    };

    return success({
      message: "Dashboard analytics loaded.",
      data: {
        summary,
        donationTrend: donationTrendRows?.[0] || [],
        donorDemographics: {
          byGender: genderRows?.[0] || [],
          byLanguage: languageRows?.[0] || [],
          byCountry: countryRows?.[0] || [],
        },
        shippingStatus: shippingRows?.[0] || [],
        feedbackSummary: {
          averageRating: summary.averageFeedbackRating || 0,
          byRating: feedbackRatingRows?.[0] || [],
          byStatus: feedbackStatusRows?.[0] || [],
        },
        inventoryAlerts: (inventoryRows?.[0] || []).map((item) => ({
          label: item.itemName,
          code: item.code,
          currentStock: item.currentStock,
          reorderLevel: item.reorderLevel,
        })),
        eventSummary: eventSummaryRow,
        financeOverview: {
          totalInvoiceAmount: financeInvoiceRow.totalInvoiceAmount || 0,
          outstandingPayablesAmount: summary.outstandingPayablesAmount || 0,
          donationValue: summary.totalDonationValue || 0,
          revenueVsCost: [
            { label: "Donations", value: Number(summary.totalDonationValue || 0) },
            { label: "Invoices", value: Number(financeInvoiceRow.totalInvoiceAmount || 0) },
            {
              label: "Outstanding payables",
              value: Number(summary.outstandingPayablesAmount || 0),
            },
          ],
          payableStatuses: payableRows?.[0] || [],
        },
      },
    });
  } finally {
    await connection.end();
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    try {
      if (url.pathname === "/" || url.pathname === "/api/health") {
        return json({
          success: true,
          service: "elder-care-api",
          message: "Worker is running.",
          timestamp: new Date().toISOString(),
        });
      }

      if (url.pathname === "/api/health/db" && request.method === "GET") {
        let connection;

        try {
          connection = await connect(env);
          const [rows] = await connection.query(
            "SELECT DATABASE() AS database_name, NOW() AS server_time;",
          );

          return json({
            success: true,
            message: "Database connection is healthy.",
            database: rows?.[0]?.database_name ?? null,
            serverTime: rows?.[0]?.server_time ?? null,
          });
        } catch (error) {
          return failure("Database connection failed.", 500, {
            error: error instanceof Error ? error.message : "Unknown error",
          });
        } finally {
          if (connection) {
            await connection.end();
          }
        }
      }

      if (url.pathname === "/api/health/tables" && request.method === "GET") {
        let connection;

        try {
          connection = await connect(env);
          const [rows] = await connection.query("SHOW TABLES;");

          return json({
            success: true,
            tableCount: Array.isArray(rows) ? rows.length : 0,
            tables: rows,
          });
        } catch (error) {
          return failure("Could not read database tables.", 500, {
            error: error instanceof Error ? error.message : "Unknown error",
          });
        } finally {
          if (connection) {
            await connection.end();
          }
        }
      }

      if (url.pathname === "/api/health/donors-count" && request.method === "GET") {
        return await getDonorsCount(env);
      }

      if (url.pathname === "/api/health/donations-count" && request.method === "GET") {
        return await getDonationsCount(env);
      }

      if (url.pathname === "/api/health/summary" && request.method === "GET") {
        return await getSummary(env);
      }

      if (url.pathname === "/api/dashboard/analytics" && request.method === "GET") {
        return await getDashboardAnalytics(env);
      }

      if (url.pathname === "/api/public/events" && request.method === "GET") {
        return await listPublicEvents(env);
      }

      if (url.pathname === "/api/auth/login" && request.method === "POST") {
        return await loginEmployee(request, env);
      }

      if (url.pathname === "/api/donor-auth/register" && request.method === "POST") {
        return await registerDonor(request, env);
      }

      if (url.pathname === "/api/donor-auth/login" && request.method === "POST") {
        return await loginDonor(request, env);
      }

      if (url.pathname === "/api/public/donations" && request.method === "POST") {
        return await createDonation(request, env);
      }

      if (url.pathname === "/api/public/feedback" && request.method === "POST") {
        return await createFeedback(request, env);
      }

      return failure("Route not found.", 404, {
        availableRoutes: [
          "/api/health",
          "/api/health/db",
          "/api/health/tables",
          "/api/health/donors-count",
          "/api/health/donations-count",
          "/api/health/summary",
          "/api/dashboard/analytics",
          "/api/public/events",
          "/api/auth/login",
          "/api/donor-auth/register",
          "/api/donor-auth/login",
          "/api/public/donations",
          "/api/public/feedback",
        ],
      });
    } catch (error) {
      return failure(error.message || "Request failed.", error.statusCode || 500, {
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
};
