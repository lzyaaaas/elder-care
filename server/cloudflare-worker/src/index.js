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

function requireAuthenticatedUser(request, env, allowedTypes = []) {
  const token = getAuthToken(request);

  if (!token) {
    throw Object.assign(new Error("Authentication required."), {
      statusCode: 401,
    });
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET || "worker-dev-secret");

    if (allowedTypes.length && !allowedTypes.includes(payload.accountType)) {
      throw Object.assign(new Error("You do not have access to this resource."), {
        statusCode: 403,
      });
    }

    return payload;
  } catch (_error) {
    throw Object.assign(new Error("Invalid or expired token."), {
      statusCode: 401,
    });
  }
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
    if (email === "demo.donor@example.org" && password === "donor123") {
      const [demoRows] = await connection.query(
        `SELECT id, donor_code
         FROM donors
         WHERE email = ?
         LIMIT 1`,
        [email],
      );
      const demoHash = await bcrypt.hash("donor123", 10);

      if (demoRows?.[0]?.id) {
        await connection.query(
          `UPDATE donors
           SET first_name = 'Demo',
               last_name = 'Donor',
               donor_code = COALESCE(NULLIF(donor_code, ''), ?),
               country = COALESCE(NULLIF(country, ''), 'China'),
               city = COALESCE(city, 'Shanghai'),
               preferred_language = COALESCE(preferred_language, 'en'),
               password_hash = ?,
               account_status = 'ACTIVE',
               supporter_type = 'DONOR'
           WHERE id = ?`,
          [generateCode("DON"), demoHash, demoRows[0].id],
        );
      } else {
        await connection.query(
          `INSERT INTO donors (
            donor_code, first_name, last_name, birthday, gender, country, state, city,
            email, phone, preferred_language, password_hash, account_status, supporter_type,
            source_event_id, last_login_at, registration_date
          ) VALUES (?, 'Demo', 'Donor', NULL, 'PREFER_NOT_TO_SAY', 'China', NULL, 'Shanghai', ?, NULL, 'en', ?, 'ACTIVE', 'DONOR', NULL, NOW(), CURRENT_DATE())`,
          [generateCode("DON"), email, demoHash],
        );
      }
    }

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

async function getDonorProfile(request, env) {
  const authUser = requireAuthenticatedUser(request, env, ["DONOR"]);
  const connection = await connect(env);

  try {
    const [rows] = await connection.query(
      `SELECT d.id, d.donor_code, d.first_name, d.last_name, d.email, d.birthday, d.gender,
              d.phone, d.country, d.state, d.city, d.preferred_language, d.supporter_type,
              d.account_status, d.registration_date, d.last_login_at,
              e.id AS source_event_id, e.event_name AS source_event_name
       FROM donors d
       LEFT JOIN events e ON e.id = d.source_event_id
       WHERE d.id = ?
       LIMIT 1`,
      [authUser.id],
    );

    const donor = rows?.[0];

    if (!donor) {
      return failure("Donor not found.", 404);
    }

    return success({
      message: "Donor profile retrieved.",
      data: {
        id: donor.id,
        donorCode: donor.donor_code,
        firstName: donor.first_name,
        lastName: donor.last_name,
        email: donor.email,
        birthday: donor.birthday,
        gender: donor.gender,
        maritalStatus: "PREFER_NOT_TO_SAY",
        phone: donor.phone,
        country: donor.country,
        state: donor.state,
        city: donor.city,
        preferredLanguage: donor.preferred_language,
        supporterType: donor.supporter_type,
        accountStatus: donor.account_status,
        registrationDate: donor.registration_date,
        lastLoginAt: donor.last_login_at,
        sourceEvent: donor.source_event_id
          ? {
              id: donor.source_event_id,
              eventName: donor.source_event_name,
            }
          : null,
      },
    });
  } finally {
    await connection.end();
  }
}

async function listDonorDonations(request, env) {
  const authUser = requireAuthenticatedUser(request, env, ["DONOR"]);
  const connection = await connect(env);

  try {
    const [rows] = await connection.query(
      `SELECT id, donation_code, donation_amount, donation_date, donation_frequency, status
       FROM donation_receivables
       WHERE donor_id = ?
       ORDER BY donation_date DESC, id DESC`,
      [authUser.id],
    );

    return success({
      message: "Donor donations retrieved.",
      data: rows.map((row) => ({
        id: row.id,
        donationCode: row.donation_code,
        donationAmount: row.donation_amount,
        donationDate: row.donation_date,
        donationFrequency: row.donation_frequency,
        status: row.status,
      })),
    });
  } finally {
    await connection.end();
  }
}

async function listDonorReceipts(request, env) {
  const authUser = requireAuthenticatedUser(request, env, ["DONOR"]);
  const connection = await connect(env);

  try {
    const [rows] = await connection.query(
      `SELECT r.id, r.receipt_number, r.amount, r.receipt_date, r.payment_method,
              dr.id AS donation_id, dr.donation_code
       FROM donation_receipts r
       JOIN donation_receivables dr ON dr.id = r.donation_id
       WHERE dr.donor_id = ?
       ORDER BY r.receipt_date DESC, r.id DESC`,
      [authUser.id],
    );

    return success({
      message: "Donor receipts retrieved.",
      data: rows.map((row) => ({
        id: row.id,
        receiptNumber: row.receipt_number,
        amount: row.amount,
        receiptDate: row.receipt_date,
        paymentMethod: row.payment_method,
        donation: {
          id: row.donation_id,
          donationCode: row.donation_code,
        },
      })),
    });
  } finally {
    await connection.end();
  }
}

async function listDonorShipping(request, env) {
  const authUser = requireAuthenticatedUser(request, env, ["DONOR"]);
  const connection = await connect(env);

  try {
    const [rows] = await connection.query(
      `SELECT s.id, s.carrier, s.tracking_number, s.shipped_date, s.status,
              dr.id AS donation_id, dr.donation_code
       FROM shippings s
       JOIN donation_receivables dr ON dr.id = s.donation_id
       WHERE dr.donor_id = ?
       ORDER BY s.shipped_date DESC, s.id DESC`,
      [authUser.id],
    );

    return success({
      message: "Donor shipping records retrieved.",
      data: rows.map((row) => ({
        id: row.id,
        carrier: row.carrier,
        trackingNumber: row.tracking_number,
        shippedDate: row.shipped_date,
        status: row.status,
        donation: {
          id: row.donation_id,
          donationCode: row.donation_code,
        },
      })),
    });
  } finally {
    await connection.end();
  }
}

async function listDonorFeedback(request, env) {
  const authUser = requireAuthenticatedUser(request, env, ["DONOR"]);
  const connection = await connect(env);

  try {
    const [rows] = await connection.query(
      `SELECT f.id, f.feedback_content, f.rating, f.feedback_date, f.response_content, f.status,
              dr.id AS donation_id, dr.donation_code
       FROM feedback f
       JOIN donation_receivables dr ON dr.id = f.donation_id
       WHERE dr.donor_id = ?
       ORDER BY f.feedback_date DESC, f.id DESC`,
      [authUser.id],
    );

    return success({
      message: "Donor feedback retrieved.",
      data: rows.map((row) => ({
        id: row.id,
        feedbackContent: row.feedback_content,
        rating: row.rating,
        feedbackDate: row.feedback_date,
        responseContent: row.response_content,
        status: row.status,
        donation: {
          id: row.donation_id,
          donationCode: row.donation_code,
        },
      })),
    });
  } finally {
    await connection.end();
  }
}

async function createDonorFeedback(request, env) {
  const authUser = requireAuthenticatedUser(request, env, ["DONOR"]);
  const body = await readBody(request);
  const donationId = requirePositiveNumber(body.donationId, "Donation");
  const feedbackContent = requireNonEmptyString(body.feedbackContent, "Feedback content");
  const rating = body.rating == null ? null : requirePositiveNumber(body.rating, "Rating");
  const connection = await connect(env);

  try {
    const [donationRows] = await connection.query(
      `SELECT id
       FROM donation_receivables
       WHERE id = ? AND donor_id = ?
       LIMIT 1`,
      [donationId, authUser.id],
    );

    if (!donationRows?.[0]?.id) {
      return failure("Donation not found for this donor.", 404);
    }

    await connection.query(
      `INSERT INTO feedback (donation_id, feedback_content, rating, feedback_date, status)
       VALUES (?, ?, ?, CURRENT_DATE(), 'NEW')`,
      [donationId, feedbackContent, rating ? Math.min(rating, 5) : null],
    );

    return success({
      status: 201,
      message: "Feedback submitted.",
      data: true,
    });
  } finally {
    await connection.end();
  }
}

async function updateDonorProfile(request, env) {
  const authUser = requireAuthenticatedUser(request, env, ["DONOR"]);
  const body = await readBody(request);
  const connection = await connect(env);

  try {
    const updates = [];
    const values = [];
    const fieldMap = [
      ["firstName", "first_name"],
      ["lastName", "last_name"],
      ["birthday", "birthday"],
      ["gender", "gender"],
      ["phone", "phone"],
      ["country", "country"],
      ["state", "state"],
      ["city", "city"],
      ["preferredLanguage", "preferred_language"],
    ];

    for (const [inputKey, column] of fieldMap) {
      if (!(inputKey in body)) {
        continue;
      }

      let value = body[inputKey];
      if (inputKey === "birthday") {
        value = normalizeDate(value);
      } else if (inputKey === "gender") {
        value = optionalEnum(value, genderValues, "Gender");
      } else {
        value = normalizeNullableString(value);
      }

      updates.push(`${column} = ?`);
      values.push(value);
    }

    if (!updates.length) {
      return failure("No profile changes were provided.", 400);
    }

    values.push(authUser.id);
    await connection.query(`UPDATE donors SET ${updates.join(", ")} WHERE id = ?`, values);

    return await getDonorProfile(request, env);
  } finally {
    await connection.end();
  }
}

async function getEmployeeProfile(request, env) {
  const authUser = requireAuthenticatedUser(request, env, ["EMPLOYEE", "ADMIN"]);
  const connection = await connect(env);

  try {
    const [rows] = await connection.query(
      `SELECT e.id, e.employee_code, e.name, e.email, e.gender, e.birthday, e.contact, e.hometown,
              e.position, e.role, e.status, e.created_at, e.updated_at,
              (SELECT COUNT(*) FROM schedules s WHERE s.employee_id = e.id) AS schedules_count,
              (SELECT COUNT(*) FROM events ev WHERE ev.employee_id = e.id) AS events_count,
              (SELECT COUNT(*) FROM donation_receivables dr WHERE dr.employee_id = e.id) AS donations_count
       FROM employees e
       WHERE e.id = ?
       LIMIT 1`,
      [authUser.id],
    );

    const employee = rows?.[0];

    if (!employee) {
      return failure("Employee not found.", 404);
    }

    return success({
      message: "Employee profile retrieved.",
      data: {
        id: employee.id,
        employeeCode: employee.employee_code,
        name: employee.name,
        email: employee.email,
        gender: employee.gender,
        birthday: employee.birthday,
        maritalStatus: "PREFER_NOT_TO_SAY",
        contact: employee.contact,
        hometown: employee.hometown,
        position: employee.position,
        role: employee.role,
        status: employee.status,
        createdAt: employee.created_at,
        updatedAt: employee.updated_at,
        _count: {
          schedules: employee.schedules_count,
          events: employee.events_count,
          donations: employee.donations_count,
        },
      },
    });
  } finally {
    await connection.end();
  }
}

async function updateEmployeeProfile(request, env) {
  const authUser = requireAuthenticatedUser(request, env, ["EMPLOYEE", "ADMIN"]);
  const body = await readBody(request);
  const connection = await connect(env);

  try {
    const updates = [];
    const values = [];
    const fieldMap = [
      ["name", "name"],
      ["email", "email"],
      ["contact", "contact"],
    ];

    for (const [inputKey, column] of fieldMap) {
      if (!(inputKey in body)) {
        continue;
      }

      updates.push(`${column} = ?`);
      values.push(normalizeNullableString(body[inputKey]));
    }

    if (!updates.length) {
      return failure("No profile changes were provided.", 400);
    }

    values.push(authUser.id);
    await connection.query(`UPDATE employees SET ${updates.join(", ")} WHERE id = ?`, values);

    return await getEmployeeProfile(request, env);
  } finally {
    await connection.end();
  }
}

async function updateEmployeePassword(request, env) {
  const authUser = requireAuthenticatedUser(request, env, ["EMPLOYEE", "ADMIN"]);
  const body = await readBody(request);
  const currentPassword = requireNonEmptyString(body.currentPassword, "Current password", {
    min: 1,
  });
  const newPassword = requireNonEmptyString(body.newPassword, "New password", { min: 6 });
  const connection = await connect(env);

  try {
    const [rows] = await connection.query(
      "SELECT id, password_hash FROM employees WHERE id = ? LIMIT 1",
      [authUser.id],
    );

    const employee = rows?.[0];

    if (!employee?.password_hash) {
      return failure("Employee account not found.", 404);
    }

    const isValid = await bcrypt.compare(currentPassword, employee.password_hash);

    if (!isValid) {
      return failure("Current password is incorrect.", 400);
    }

    const nextHash = await bcrypt.hash(newPassword, 10);
    await connection.query("UPDATE employees SET password_hash = ? WHERE id = ?", [
      nextHash,
      authUser.id,
    ]);

    return success({
      message: "Password updated.",
      data: true,
    });
  } finally {
    await connection.end();
  }
}

async function getEmployeeDashboard(request, env) {
  const authUser = requireAuthenticatedUser(request, env, ["EMPLOYEE", "ADMIN"]);
  const connection = await connect(env);

  try {
    const [employeeRows] = await connection.query(
      `SELECT e.id, e.employee_code, e.name, e.email, e.contact, e.position, e.role,
              (SELECT COUNT(*) FROM schedules s WHERE s.employee_id = e.id) AS schedules_count,
              (SELECT COUNT(*) FROM events ev WHERE ev.employee_id = e.id) AS events_count,
              (SELECT COUNT(*) FROM donation_receivables dr WHERE dr.employee_id = e.id) AS donations_count
       FROM employees e
       WHERE e.id = ?
       LIMIT 1`,
      [authUser.id],
    );

    const [scheduleRows] = await connection.query(
      `SELECT s.id, s.shift_date, s.start_time, s.end_time, s.status, s.notes,
              e.id AS event_id, e.event_name, e.city, e.country
       FROM schedules s
       LEFT JOIN events e ON e.id = s.event_id
       WHERE s.employee_id = ?
       ORDER BY s.shift_date ASC, s.start_time ASC
       LIMIT 4`,
      [authUser.id],
    );

    const [taskRows] = await connection.query(
      `SELECT
          (SELECT COUNT(*) FROM events WHERE employee_id = ? AND start_date >= NOW()) AS upcomingEventsCount,
          (SELECT COUNT(*) FROM shippings s JOIN donation_receivables dr ON dr.id = s.donation_id WHERE dr.employee_id = ? AND s.status IN ('PENDING', 'PREPARING', 'SHIPPED')) AS shippingTasksCount,
          (SELECT COUNT(*) FROM feedback f JOIN donation_receivables dr ON dr.id = f.donation_id WHERE dr.employee_id = ? AND f.status IN ('NEW', 'REVIEWED')) AS followUpsCount`,
      [authUser.id, authUser.id, authUser.id],
    );

    const employee = employeeRows?.[0];

    if (!employee) {
      return failure("Employee not found.", 404);
    }

    return success({
      message: "Employee dashboard loaded.",
      data: {
        employee: {
          id: employee.id,
          employeeCode: employee.employee_code,
          name: employee.name,
          email: employee.email,
          contact: employee.contact,
          position: employee.position,
          role: employee.role,
          _count: {
            schedules: employee.schedules_count,
            events: employee.events_count,
            donations: employee.donations_count,
          },
        },
        upcomingSchedules: (scheduleRows || []).map((shift) => ({
          id: shift.id,
          shiftDate: shift.shift_date,
          startTime: shift.start_time,
          endTime: shift.end_time,
          status: shift.status,
          notes: shift.notes,
          event: shift.event_id
            ? {
                id: shift.event_id,
                eventName: shift.event_name,
                city: shift.city,
                country: shift.country,
              }
            : null,
        })),
        taskSummary: taskRows?.[0] || {
          upcomingEventsCount: 0,
          shippingTasksCount: 0,
          followUpsCount: 0,
        },
      },
    });
  } finally {
    await connection.end();
  }
}

async function listEmployeeSchedule(request, env) {
  const authUser = requireAuthenticatedUser(request, env, ["EMPLOYEE", "ADMIN"]);
  const url = new URL(request.url);
  const filter = url.searchParams.get("filter") || "all";
  const connection = await connect(env);

  try {
    const [rows] = await connection.query(
      `SELECT s.id, s.shift_date, s.start_time, s.end_time, s.status, s.notes,
              e.id AS event_id, e.event_name, e.city, e.country
       FROM schedules s
       LEFT JOIN events e ON e.id = s.event_id
       WHERE s.employee_id = ?
       ORDER BY s.shift_date ASC, s.start_time ASC, s.id ASC`,
      [authUser.id],
    );

    const today = new Date().toISOString().slice(0, 10);
    let items = rows.map((row) => ({
      id: row.id,
      shiftDate: row.shift_date,
      startTime: row.start_time,
      endTime: row.end_time,
      status: row.status,
      notes: row.notes,
      event: row.event_id
        ? {
            id: row.event_id,
            eventName: row.event_name,
            city: row.city,
            country: row.country,
          }
        : null,
    }));

    if (filter === "completed") {
      items = items.filter((item) => item.status === "COMPLETED");
    } else if (filter === "cancelled") {
      items = items.filter((item) => item.status === "CANCELLED");
    } else if (filter === "upcoming") {
      items = items.filter((item) => item.status === "SCHEDULED" && String(item.shiftDate).slice(0, 10) >= today);
    }

    return success({
      message: "Employee schedule retrieved.",
      data: items,
    });
  } finally {
    await connection.end();
  }
}

async function listEmployeeEvents(request, env) {
  const authUser = requireAuthenticatedUser(request, env, ["EMPLOYEE", "ADMIN"]);
  const connection = await connect(env);

  try {
    const [rows] = await connection.query(
      `SELECT e.id, e.event_name, e.description, e.type, e.start_date, e.city, e.country, e.is_active,
              (SELECT COUNT(*) FROM schedules s WHERE s.event_id = e.id AND s.employee_id = ?) AS schedules_count
       FROM events e
       WHERE e.employee_id = ?
       ORDER BY e.start_date DESC, e.id DESC`,
      [authUser.id, authUser.id],
    );

    return success({
      message: "Employee events retrieved.",
      data: rows.map((row) => ({
        id: row.id,
        eventName: row.event_name,
        description: row.description,
        type: row.type,
        startDate: row.start_date,
        city: row.city,
        country: row.country,
        isActive: Boolean(row.is_active),
        schedules: Array.from({ length: Number(row.schedules_count || 0) }, (_, index) => ({ id: index + 1 })),
      })),
    });
  } finally {
    await connection.end();
  }
}

async function listEmployeeDonations(request, env) {
  const authUser = requireAuthenticatedUser(request, env, ["EMPLOYEE", "ADMIN"]);
  const connection = await connect(env);

  try {
    const [rows] = await connection.query(
      `SELECT dr.id, dr.donation_code, dr.donation_amount, dr.donation_date, dr.status,
              d.first_name, d.last_name,
              e.event_name
       FROM donation_receivables dr
       LEFT JOIN donors d ON d.id = dr.donor_id
       LEFT JOIN events e ON e.id = dr.event_id
       WHERE dr.employee_id = ?
       ORDER BY dr.donation_date DESC, dr.id DESC`,
      [authUser.id],
    );

    return success({
      message: "Employee donation tasks retrieved.",
      data: rows.map((row) => ({
        id: row.id,
        donationCode: row.donation_code,
        donationAmount: row.donation_amount,
        donationDate: row.donation_date,
        status: row.status,
        donor: row.first_name ? { firstName: row.first_name, lastName: row.last_name } : null,
        event: row.event_name ? { eventName: row.event_name } : null,
      })),
    });
  } finally {
    await connection.end();
  }
}

async function listEmployeeShippings(request, env) {
  const authUser = requireAuthenticatedUser(request, env, ["EMPLOYEE", "ADMIN"]);
  const connection = await connect(env);

  try {
    const [rows] = await connection.query(
      `SELECT s.id, s.carrier, s.tracking_number, s.shipped_date, s.status,
              dr.donation_code, d.first_name, d.last_name
       FROM shippings s
       JOIN donation_receivables dr ON dr.id = s.donation_id
       LEFT JOIN donors d ON d.id = dr.donor_id
       WHERE dr.employee_id = ?
       ORDER BY s.shipped_date DESC, s.id DESC`,
      [authUser.id],
    );

    return success({
      message: "Employee shipping tasks retrieved.",
      data: rows.map((row) => ({
        id: row.id,
        carrier: row.carrier,
        trackingNumber: row.tracking_number,
        shippedDate: row.shipped_date,
        status: row.status,
        donation: {
          donationCode: row.donation_code,
          donor: row.first_name ? { firstName: row.first_name, lastName: row.last_name } : null,
        },
      })),
    });
  } finally {
    await connection.end();
  }
}

async function listEmployeeFeedback(request, env) {
  const authUser = requireAuthenticatedUser(request, env, ["EMPLOYEE", "ADMIN"]);
  const connection = await connect(env);

  try {
    const [rows] = await connection.query(
      `SELECT f.id, f.feedback_content, f.rating, f.feedback_date, f.response_content, f.status,
              dr.donation_code, d.first_name, d.last_name
       FROM feedback f
       JOIN donation_receivables dr ON dr.id = f.donation_id
       LEFT JOIN donors d ON d.id = dr.donor_id
       WHERE dr.employee_id = ?
       ORDER BY f.feedback_date DESC, f.id DESC`,
      [authUser.id],
    );

    return success({
      message: "Employee follow-up records retrieved.",
      data: rows.map((row) => ({
        id: row.id,
        feedbackContent: row.feedback_content,
        rating: row.rating,
        feedbackDate: row.feedback_date,
        responseContent: row.response_content,
        status: row.status,
        donation: {
          donationCode: row.donation_code,
          donor: row.first_name ? { firstName: row.first_name, lastName: row.last_name } : null,
        },
      })),
    });
  } finally {
    await connection.end();
  }
}

async function listEmployees(env) {
  const connection = await connect(env);

  try {
    const [rows] = await connection.query(
      `SELECT e.id, e.employee_code, e.name, e.email, e.gender, e.birthday, e.contact, e.schedule,
              e.hometown, e.position, e.role, e.status, e.created_at, e.password_hash,
              (SELECT COUNT(*) FROM schedules s WHERE s.employee_id = e.id) AS schedules_count,
              (SELECT COUNT(*) FROM donation_receivables dr WHERE dr.employee_id = e.id) AS donations_count,
              (SELECT COUNT(*) FROM events ev WHERE ev.employee_id = e.id) AS events_count,
              (SELECT COUNT(*) FROM invoices i WHERE i.employee_id = e.id) AS invoices_count
       FROM employees e
       ORDER BY e.id ASC`,
    );

    return success({
      message: "Employees retrieved.",
      data: {
        items: (rows || []).map((row) => ({
          id: row.id,
          employeeCode: row.employee_code,
          name: row.name,
          email: row.email,
          gender: row.gender,
          maritalStatus: "PREFER_NOT_TO_SAY",
          birthday: row.birthday,
          contact: row.contact,
          schedule: row.schedule,
          hometown: row.hometown,
          position: row.position,
          role: row.role,
          status: row.status,
          createdAt: row.created_at,
          passwordConfigured: Boolean(row.password_hash),
          _count: {
            schedules: Number(row.schedules_count || 0),
            donations: Number(row.donations_count || 0),
            events: Number(row.events_count || 0),
            invoices: Number(row.invoices_count || 0),
          },
        })),
      },
    });
  } finally {
    await connection.end();
  }
}

async function listSchedules(env) {
  const connection = await connect(env);

  try {
    const [rows] = await connection.query(
      `SELECT s.id, s.employee_id, s.event_id, s.shift_date, s.start_time, s.end_time, s.status, s.notes,
              e.name AS employee_name,
              ev.event_name
       FROM schedules s
       LEFT JOIN employees e ON e.id = s.employee_id
       LEFT JOIN events ev ON ev.id = s.event_id
       ORDER BY s.shift_date ASC, s.start_time ASC, s.id ASC`,
    );

    return success({
      message: "Schedules retrieved.",
      data: {
        items: (rows || []).map((row) => ({
          id: row.id,
          employeeId: row.employee_id,
          eventId: row.event_id,
          shiftDate: row.shift_date,
          startTime: row.start_time,
          endTime: row.end_time,
          status: row.status,
          notes: row.notes,
          employee: row.employee_name ? { name: row.employee_name } : null,
          event: row.event_name ? { eventName: row.event_name } : null,
        })),
      },
    });
  } finally {
    await connection.end();
  }
}

async function listDonors(env) {
  const connection = await connect(env);

  try {
    const [rows] = await connection.query(
      `SELECT d.id, d.donor_code, d.first_name, d.last_name, d.birthday, d.gender, d.country, d.state, d.city,
              d.street_address, d.postal_code, d.email, d.phone, d.preferred_language, d.account_status,
              d.supporter_type, d.registration_date, e.id AS source_event_id, e.event_name AS source_event_name
       FROM donors d
       LEFT JOIN events e ON e.id = d.source_event_id
       ORDER BY d.id ASC`,
    );

    return success({
      message: "Donors retrieved.",
      data: {
        items: (rows || []).map((row) => ({
          id: row.id,
          donorCode: row.donor_code,
          firstName: row.first_name,
          lastName: row.last_name,
          birthday: row.birthday,
          gender: row.gender,
          maritalStatus: "PREFER_NOT_TO_SAY",
          country: row.country,
          state: row.state,
          city: row.city,
          streetAddress: row.street_address,
          postalCode: row.postal_code,
          email: row.email,
          phone: row.phone,
          preferredLanguage: row.preferred_language,
          accountStatus: row.account_status,
          supporterType: row.supporter_type,
          registrationDate: row.registration_date,
          sourceEvent: row.source_event_id
            ? { id: row.source_event_id, eventName: row.source_event_name }
            : null,
        })),
      },
    });
  } finally {
    await connection.end();
  }
}

async function listDonationReceivables(env) {
  const connection = await connect(env);

  try {
    const [rows] = await connection.query(
      `SELECT dr.id, dr.donation_code, dr.donation_amount, dr.donation_date, dr.donation_frequency, dr.status, dr.notes,
              d.id AS donor_id, d.first_name, d.last_name,
              ev.id AS event_id, ev.event_name,
              dk.id AS kit_id, dk.kit_name,
              e.id AS employee_id, e.name AS employee_name
       FROM donation_receivables dr
       LEFT JOIN donors d ON d.id = dr.donor_id
       LEFT JOIN events ev ON ev.id = dr.event_id
       LEFT JOIN donation_kits dk ON dk.id = dr.donation_kit_id
       LEFT JOIN employees e ON e.id = dr.employee_id
       ORDER BY dr.donation_date DESC, dr.id DESC`,
    );

    return success({
      message: "Donations retrieved.",
      data: {
        items: (rows || []).map((row) => ({
          id: row.id,
          donationCode: row.donation_code,
          donationAmount: row.donation_amount,
          donationDate: row.donation_date,
          donationFrequency: row.donation_frequency,
          status: row.status,
          notes: row.notes,
          donor: row.donor_id
            ? {
                id: row.donor_id,
                firstName: row.first_name,
                lastName: row.last_name,
              }
            : null,
          event: row.event_id ? { id: row.event_id, eventName: row.event_name } : null,
          donationKit: row.kit_id ? { id: row.kit_id, kitName: row.kit_name } : null,
          employee: row.employee_id ? { id: row.employee_id, name: row.employee_name } : null,
        })),
      },
    });
  } finally {
    await connection.end();
  }
}

async function listReceipts(env) {
  const connection = await connect(env);

  try {
    const [rows] = await connection.query(
      `SELECT r.id, r.receipt_number, r.donation_id, r.amount, r.receipt_date, r.payment_method, r.transaction_id, r.status, r.notes,
              dr.donation_code,
              d.first_name, d.last_name
       FROM donation_receipts r
       LEFT JOIN donation_receivables dr ON dr.id = r.donation_id
       LEFT JOIN donors d ON d.id = dr.donor_id
       ORDER BY r.receipt_date DESC, r.id DESC`,
    );

    return success({
      message: "Receipts retrieved.",
      data: {
        items: (rows || []).map((row) => ({
          id: row.id,
          receiptNumber: row.receipt_number,
          donationId: row.donation_id,
          amount: row.amount,
          receiptDate: row.receipt_date,
          paymentMethod: row.payment_method,
          transactionId: row.transaction_id,
          status: row.status,
          notes: row.notes,
          donation: row.donation_id
            ? {
                donationCode: row.donation_code,
                donor: row.first_name ? { firstName: row.first_name, lastName: row.last_name } : null,
              }
            : null,
        })),
      },
    });
  } finally {
    await connection.end();
  }
}

async function listShippings(env) {
  const connection = await connect(env);

  try {
    const [rows] = await connection.query(
      `SELECT s.id, s.donation_id, s.tracking_number, s.carrier, s.shipped_date, s.delivery_date, s.shipping_cost, s.status,
              dr.donation_code,
              d.first_name, d.last_name
       FROM shippings s
       LEFT JOIN donation_receivables dr ON dr.id = s.donation_id
       LEFT JOIN donors d ON d.id = dr.donor_id
       ORDER BY s.id DESC`,
    );

    return success({
      message: "Shipping records retrieved.",
      data: {
        items: (rows || []).map((row) => ({
          id: row.id,
          donationId: row.donation_id,
          trackingNumber: row.tracking_number,
          carrier: row.carrier,
          shippedDate: row.shipped_date,
          deliveryDate: row.delivery_date,
          shippingCost: row.shipping_cost,
          status: row.status,
          donation: row.donation_id
            ? {
                donationCode: row.donation_code,
                donor: row.first_name ? { firstName: row.first_name, lastName: row.last_name } : null,
              }
            : null,
        })),
      },
    });
  } finally {
    await connection.end();
  }
}

async function listFeedback(env) {
  const connection = await connect(env);

  try {
    const [rows] = await connection.query(
      `SELECT f.id, f.donation_id, f.feedback_content, f.rating, f.feedback_date, f.response_content, f.response_date, f.status,
              dr.donation_code,
              d.first_name, d.last_name
       FROM feedback f
       LEFT JOIN donation_receivables dr ON dr.id = f.donation_id
       LEFT JOIN donors d ON d.id = dr.donor_id
       ORDER BY f.feedback_date DESC, f.id DESC`,
    );

    return success({
      message: "Feedback records retrieved.",
      data: {
        items: (rows || []).map((row) => ({
          id: row.id,
          donationId: row.donation_id,
          feedbackContent: row.feedback_content,
          rating: row.rating,
          feedbackDate: row.feedback_date,
          responseContent: row.response_content,
          responseDate: row.response_date,
          status: row.status,
          donation: row.donation_id
            ? {
                donationCode: row.donation_code,
                donor: row.first_name ? { firstName: row.first_name, lastName: row.last_name } : null,
              }
            : null,
        })),
      },
    });
  } finally {
    await connection.end();
  }
}

async function listDonationKits(env) {
  const connection = await connect(env);

  try {
    const [kitRows] = await connection.query(
      `SELECT id, kit_code, kit_name, description, is_active
       FROM donation_kits
       ORDER BY id ASC`,
    );
    const [componentRows] = await connection.query(
      `SELECT kc.id, kc.donation_kit_id, kc.quantity,
              b.unit_cost AS book_unit_cost,
              env.unit_cost AS envelope_unit_cost,
              bx.unit_cost AS box_unit_cost
       FROM kit_components kc
       LEFT JOIN books b ON b.id = kc.book_id
       LEFT JOIN envelopes env ON env.id = kc.envelope_id
       LEFT JOIN boxes bx ON bx.id = kc.box_id`,
    );

    const componentMap = new Map();
    for (const row of componentRows || []) {
      const current = componentMap.get(row.donation_kit_id) || [];
      current.push({
        quantity: row.quantity,
        book: row.book_unit_cost != null ? { unitCost: row.book_unit_cost } : null,
        envelope: row.envelope_unit_cost != null ? { unitCost: row.envelope_unit_cost } : null,
        box: row.box_unit_cost != null ? { unitCost: row.box_unit_cost } : null,
      });
      componentMap.set(row.donation_kit_id, current);
    }

    return success({
      message: "Donation kits retrieved.",
      data: {
        items: (kitRows || []).map((row) => ({
          id: row.id,
          kitCode: row.kit_code,
          kitName: row.kit_name,
          description: row.description,
          isActive: Boolean(row.is_active),
          components: componentMap.get(row.id) || [],
        })),
      },
    });
  } finally {
    await connection.end();
  }
}

async function listBooks(env) {
  const connection = await connect(env);

  try {
    const [rows] = await connection.query(
      `SELECT b.id, b.press_id, b.book_series_id, b.book_format_id, b.title, b.description, b.page_count,
              b.unit_cost, b.current_stock, b.reorder_level, b.publication_date,
              p.press_name, bs.series_name, bf.format_type, bf.language
       FROM books b
       LEFT JOIN presses p ON p.id = b.press_id
       LEFT JOIN book_series bs ON bs.id = b.book_series_id
       LEFT JOIN book_formats bf ON bf.id = b.book_format_id
       ORDER BY b.id ASC`,
    );

    return success({
      message: "Books retrieved.",
      data: {
        items: (rows || []).map((row) => ({
          id: row.id,
          pressId: row.press_id,
          bookSeriesId: row.book_series_id,
          bookFormatId: row.book_format_id,
          title: row.title,
          description: row.description,
          pageCount: row.page_count,
          unitCost: row.unit_cost,
          currentStock: row.current_stock,
          reorderLevel: row.reorder_level,
          publicationDate: row.publication_date,
          press: row.press_name ? { pressName: row.press_name } : null,
          bookSeries: row.series_name ? { seriesName: row.series_name } : null,
          bookFormat: row.format_type ? { formatType: row.format_type, language: row.language } : null,
        })),
      },
    });
  } finally {
    await connection.end();
  }
}

async function listEnvelopes(env) {
  const connection = await connect(env);

  try {
    const [rows] = await connection.query(
      `SELECT id, envelope_code, size, unit_cost, current_stock, reorder_level, description, last_restock_date, is_active
       FROM envelopes
       ORDER BY id ASC`,
    );

    return success({
      message: "Envelopes retrieved.",
      data: {
        items: (rows || []).map((row) => ({
          id: row.id,
          envelopeCode: row.envelope_code,
          size: row.size,
          unitCost: row.unit_cost,
          currentStock: row.current_stock,
          reorderLevel: row.reorder_level,
          description: row.description,
          lastRestockDate: row.last_restock_date,
          isActive: Boolean(row.is_active),
        })),
      },
    });
  } finally {
    await connection.end();
  }
}

async function listBoxes(env) {
  const connection = await connect(env);

  try {
    const [rows] = await connection.query(
      `SELECT id, box_code, size, unit_cost, current_stock, reorder_level, description, last_restock_date, is_active
       FROM boxes
       ORDER BY id ASC`,
    );

    return success({
      message: "Boxes retrieved.",
      data: {
        items: (rows || []).map((row) => ({
          id: row.id,
          boxCode: row.box_code,
          size: row.size,
          unitCost: row.unit_cost,
          currentStock: row.current_stock,
          reorderLevel: row.reorder_level,
          description: row.description,
          lastRestockDate: row.last_restock_date,
          isActive: Boolean(row.is_active),
        })),
      },
    });
  } finally {
    await connection.end();
  }
}

async function listPromotionInventory(env) {
  const connection = await connect(env);

  try {
    const [rows] = await connection.query(
      `SELECT id, inventory_code, promotion_inventory_type, size, unit_cost, current_stock, reorder_level,
              description, last_restock_date, is_active
       FROM promotion_inventory
       ORDER BY id ASC`,
    );

    return success({
      message: "Promotion inventory retrieved.",
      data: {
        items: (rows || []).map((row) => ({
          id: row.id,
          inventoryCode: row.inventory_code,
          promotionInventoryType: row.promotion_inventory_type,
          size: row.size,
          unitCost: row.unit_cost,
          currentStock: row.current_stock,
          reorderLevel: row.reorder_level,
          description: row.description,
          lastRestockDate: row.last_restock_date,
          isActive: Boolean(row.is_active),
        })),
      },
    });
  } finally {
    await connection.end();
  }
}

async function listEvents(env) {
  const connection = await connect(env);

  try {
    const [rows] = await connection.query(
      `SELECT ev.id, ev.event_name, ev.description, ev.type, ev.start_date, ev.end_date, ev.country, ev.state, ev.city,
              ev.employee_id, ev.is_active, e.name AS employee_name
       FROM events ev
       LEFT JOIN employees e ON e.id = ev.employee_id
       ORDER BY ev.start_date DESC, ev.id DESC`,
    );

    return success({
      message: "Events retrieved.",
      data: {
        items: (rows || []).map((row) => ({
          id: row.id,
          eventName: row.event_name,
          description: row.description,
          type: row.type,
          startDate: row.start_date,
          endDate: row.end_date,
          country: row.country,
          state: row.state,
          city: row.city,
          employeeId: row.employee_id,
          isActive: Boolean(row.is_active),
          employee: row.employee_name ? { name: row.employee_name } : null,
        })),
      },
    });
  } finally {
    await connection.end();
  }
}

async function listPromotionAssets(env) {
  const connection = await connect(env);

  try {
    const [rows] = await connection.query(
      `SELECT id, asset_code, asset_category, asset_name, description, asset_type, is_active
       FROM promotion_assets
       ORDER BY id ASC`,
    );

    return success({
      message: "Promotion assets retrieved.",
      data: {
        items: (rows || []).map((row) => ({
          id: row.id,
          assetCode: row.asset_code,
          assetCategory: row.asset_category,
          assetName: row.asset_name,
          description: row.description,
          assetType: row.asset_type,
          isActive: Boolean(row.is_active),
        })),
      },
    });
  } finally {
    await connection.end();
  }
}

async function listVendors(env) {
  const connection = await connect(env);

  try {
    const [rows] = await connection.query(
      `SELECT id, vendor_code, name, contact_person, phone_number, address, email, rating, supply_type, last_supply_date, is_active
       FROM vendors
       ORDER BY id ASC`,
    );

    return success({
      message: "Vendors retrieved.",
      data: {
        items: (rows || []).map((row) => ({
          id: row.id,
          vendorCode: row.vendor_code,
          name: row.name,
          contactPerson: row.contact_person,
          phoneNumber: row.phone_number,
          address: row.address,
          email: row.email,
          rating: row.rating,
          supplyType: row.supply_type,
          lastSupplyDate: row.last_supply_date,
          isActive: Boolean(row.is_active),
        })),
      },
    });
  } finally {
    await connection.end();
  }
}

async function listInvoices(env) {
  const connection = await connect(env);

  try {
    const [invoiceRows] = await connection.query(
      `SELECT i.id, i.invoice_number, i.employee_id, i.invoice_date, i.due_date, i.vendor_id, i.status, i.notes,
              i.subtotal, i.tax_amount, i.total_amount,
              e.name AS employee_name,
              v.name AS vendor_name
       FROM invoices i
       LEFT JOIN employees e ON e.id = i.employee_id
       LEFT JOIN vendors v ON v.id = i.vendor_id
       ORDER BY i.invoice_date DESC, i.id DESC`,
    );
    const [itemRows] = await connection.query(
      `SELECT ii.id, ii.invoice_id, ii.envelope_id, ii.box_id, ii.promotion_inventory_id, ii.description, ii.quantity, ii.unit_price, ii.amount,
              env.envelope_code, bx.box_code, pi.inventory_code
       FROM invoice_items ii
       LEFT JOIN envelopes env ON env.id = ii.envelope_id
       LEFT JOIN boxes bx ON bx.id = ii.box_id
       LEFT JOIN promotion_inventory pi ON pi.id = ii.promotion_inventory_id`,
    );

    const itemMap = new Map();
    for (const row of itemRows || []) {
      const current = itemMap.get(row.invoice_id) || [];
      current.push({
        id: row.id,
        description: row.description,
        quantity: row.quantity,
        unitPrice: row.unit_price,
        amount: row.amount,
        envelope: row.envelope_id ? { envelopeCode: row.envelope_code } : null,
        box: row.box_id ? { boxCode: row.box_code } : null,
        promotionInventory: row.promotion_inventory_id ? { inventoryCode: row.inventory_code } : null,
      });
      itemMap.set(row.invoice_id, current);
    }

    return success({
      message: "Invoices retrieved.",
      data: {
        items: (invoiceRows || []).map((row) => ({
          id: row.id,
          invoiceNumber: row.invoice_number,
          employeeId: row.employee_id,
          invoiceDate: row.invoice_date,
          dueDate: row.due_date,
          vendorId: row.vendor_id,
          status: row.status,
          notes: row.notes,
          subtotal: row.subtotal,
          taxAmount: row.tax_amount,
          totalAmount: row.total_amount,
          employee: row.employee_id ? { name: row.employee_name } : null,
          vendor: row.vendor_id ? { name: row.vendor_name } : null,
          items: itemMap.get(row.id) || [],
        })),
      },
    });
  } finally {
    await connection.end();
  }
}

async function listPayables(env) {
  const connection = await connect(env);

  try {
    const [rows] = await connection.query(
      `SELECT p.id, p.invoice_id, p.remaining_amount, p.due_date, p.payment_terms, p.notes, p.status,
              i.invoice_number, v.name AS vendor_name
       FROM payables p
       LEFT JOIN invoices i ON i.id = p.invoice_id
       LEFT JOIN vendors v ON v.id = i.vendor_id
       ORDER BY p.due_date ASC, p.id ASC`,
    );

    return success({
      message: "Payables retrieved.",
      data: {
        items: (rows || []).map((row) => ({
          id: row.id,
          invoiceId: row.invoice_id,
          remainingAmount: row.remaining_amount,
          dueDate: row.due_date,
          paymentTerms: row.payment_terms,
          notes: row.notes,
          status: row.status,
          invoice: row.invoice_id
            ? {
                invoiceNumber: row.invoice_number,
                vendor: row.vendor_name ? { name: row.vendor_name } : null,
              }
            : null,
        })),
      },
    });
  } finally {
    await connection.end();
  }
}

async function listPayments(env) {
  const connection = await connect(env);

  try {
    const [rows] = await connection.query(
      `SELECT ip.id, ip.payable_id, ip.amount, ip.payment_date, ip.payment_method, ip.reference_number, ip.notes,
              p.invoice_id, i.invoice_number, v.name AS vendor_name
       FROM invoice_payments ip
       LEFT JOIN payables p ON p.id = ip.payable_id
       LEFT JOIN invoices i ON i.id = p.invoice_id
       LEFT JOIN vendors v ON v.id = i.vendor_id
       ORDER BY ip.payment_date DESC, ip.id DESC`,
    );

    return success({
      message: "Payments retrieved.",
      data: {
        items: (rows || []).map((row) => ({
          id: row.id,
          payableId: row.payable_id,
          amount: row.amount,
          paymentDate: row.payment_date,
          paymentMethod: row.payment_method,
          referenceNumber: row.reference_number,
          notes: row.notes,
          payable: row.payable_id
            ? {
                invoice: row.invoice_id
                  ? {
                      invoiceNumber: row.invoice_number,
                      vendor: row.vendor_name ? { name: row.vendor_name } : null,
                    }
                  : null,
              }
            : null,
        })),
      },
    });
  } finally {
    await connection.end();
  }
}

const adminAnalyticsAttributeMap = {
  employees: [
    {
      key: "role",
      label: "Role",
      type: "enum",
      operators: ["equals", "in"],
      options: [
        { value: "ADMIN", label: "Admin" },
        { value: "OPERATIONS", label: "Operations" },
        { value: "FINANCE", label: "Finance" },
        { value: "EVENT", label: "Event" },
        { value: "VOLUNTEER", label: "Volunteer" },
      ],
    },
    {
      key: "status",
      label: "Status",
      type: "enum",
      operators: ["equals", "in"],
      options: [
        { value: "ACTIVE", label: "Active" },
        { value: "INACTIVE", label: "Inactive" },
      ],
    },
  ],
  schedules: [],
  donors: [
    {
      key: "gender",
      label: "Gender",
      type: "enum",
      operators: ["equals", "in"],
      options: [
        { value: "FEMALE", label: "Female" },
        { value: "MALE", label: "Male" },
        { value: "NON_BINARY", label: "Non-binary" },
        { value: "PREFER_NOT_TO_SAY", label: "Prefer not to say" },
      ],
    },
    {
      key: "accountStatus",
      label: "Account Status",
      type: "enum",
      operators: ["equals", "in"],
      options: [
        { value: "ACTIVE", label: "Active" },
        { value: "INACTIVE", label: "Inactive" },
      ],
    },
  ],
  donations: [],
  receipts: [],
  shipping: [],
  feedback: [],
  "donation-kits": [],
  books: [],
  envelopes: [],
  boxes: [],
  "promotion-inventory": [],
  events: [],
  "promotion-assets": [],
  vendors: [],
  invoices: [],
  payables: [],
  payments: [],
};

async function getAdminModuleItems(moduleKey, env) {
  const routeMap = {
    employees: listEmployees,
    schedules: listSchedules,
    donors: listDonors,
    donations: listDonationReceivables,
    receipts: listReceipts,
    shipping: listShippings,
    feedback: listFeedback,
    "donation-kits": listDonationKits,
    books: listBooks,
    envelopes: listEnvelopes,
    boxes: listBoxes,
    "promotion-inventory": listPromotionInventory,
    events: listEvents,
    "promotion-assets": listPromotionAssets,
    vendors: listVendors,
    invoices: listInvoices,
    payables: listPayables,
    payments: listPayments,
  };

  const handler = routeMap[moduleKey];

  if (!handler) {
    throw Object.assign(new Error("Unknown analytics module."), {
      statusCode: 404,
    });
  }

  const response = await handler(env);
  const payload = await response.json();

  if (!payload?.success) {
    throw Object.assign(new Error(payload?.message || "Analytics source failed."), {
      statusCode: 500,
    });
  }

  return payload.data?.items || [];
}

function buildAdminAnalyticsSummary(items, filters, moduleKey) {
  return {
    filteredTotal: items.length,
    sourceTotal: items.length,
    activeFilters: Array.isArray(filters) ? filters.length : 0,
    availableAttributes: (adminAnalyticsAttributeMap[moduleKey] || []).length,
  };
}

function buildAdminAnalyticsCharts(items, moduleKey) {
  if (moduleKey === "donors") {
    const grouped = items.reduce((accumulator, item) => {
      const label = item.gender || "Unknown";
      accumulator[label] = (accumulator[label] || 0) + 1;
      return accumulator;
    }, {});

    return [
      {
        key: "gender-distribution",
        kind: "bar",
        title: "Gender distribution",
        data: Object.entries(grouped).map(([label, value]) => ({ label, value })),
      },
    ];
  }

  if (moduleKey === "donations") {
    const grouped = items.reduce((accumulator, item) => {
      const label = item.status || "Unknown";
      accumulator[label] = (accumulator[label] || 0) + 1;
      return accumulator;
    }, {});

    return [
      {
        key: "donation-status",
        kind: "bar",
        title: "Donation status",
        data: Object.entries(grouped).map(([label, value]) => ({ label, value })),
      },
    ];
  }

  if (moduleKey === "events") {
    return [
      {
        key: "events-timeline",
        kind: "line",
        title: "Events loaded",
        data: items.map((item, index) => ({
          label: item.eventName || item.name || `Event ${index + 1}`,
          value: index + 1,
        })),
      },
    ];
  }

  return [];
}

async function getAdminAnalyticsMetadata(moduleKey) {
  return success({
    message: "Analytics metadata retrieved.",
    data: {
      attributes: adminAnalyticsAttributeMap[moduleKey] || [],
    },
  });
}

async function queryAdminAnalytics(moduleKey, request, env) {
  const body = await readBody(request);
  const filters = Array.isArray(body?.filters) ? body.filters : [];
  const items = await getAdminModuleItems(moduleKey, env);

  return success({
    message: "Analytics query completed.",
    data: {
      items,
      summary: buildAdminAnalyticsSummary(items, filters, moduleKey),
      charts: buildAdminAnalyticsCharts(items, moduleKey),
    },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const analyticsMatch = url.pathname.match(/^\/api\/admin-analytics\/([^/]+)\/(metadata|query)$/);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    try {
      if (analyticsMatch && request.method === "GET" && analyticsMatch[2] === "metadata") {
        return await getAdminAnalyticsMetadata(analyticsMatch[1]);
      }

      if (analyticsMatch && request.method === "POST" && analyticsMatch[2] === "query") {
        return await queryAdminAnalytics(analyticsMatch[1], request, env);
      }

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

      if (url.pathname === "/api/employees" && request.method === "GET") {
        return await listEmployees(env);
      }

      if (url.pathname === "/api/schedules" && request.method === "GET") {
        return await listSchedules(env);
      }

      if (url.pathname === "/api/donors" && request.method === "GET") {
        return await listDonors(env);
      }

      if (url.pathname === "/api/donation-receivables" && request.method === "GET") {
        return await listDonationReceivables(env);
      }

      if (url.pathname === "/api/receipts" && request.method === "GET") {
        return await listReceipts(env);
      }

      if (url.pathname === "/api/shippings" && request.method === "GET") {
        return await listShippings(env);
      }

      if (url.pathname === "/api/feedback" && request.method === "GET") {
        return await listFeedback(env);
      }

      if (url.pathname === "/api/donation-kits" && request.method === "GET") {
        return await listDonationKits(env);
      }

      if (url.pathname === "/api/books" && request.method === "GET") {
        return await listBooks(env);
      }

      if (url.pathname === "/api/envelopes" && request.method === "GET") {
        return await listEnvelopes(env);
      }

      if (url.pathname === "/api/boxes" && request.method === "GET") {
        return await listBoxes(env);
      }

      if (url.pathname === "/api/promotion-inventory" && request.method === "GET") {
        return await listPromotionInventory(env);
      }

      if (url.pathname === "/api/events" && request.method === "GET") {
        return await listEvents(env);
      }

      if (url.pathname === "/api/promotion-assets" && request.method === "GET") {
        return await listPromotionAssets(env);
      }

      if (url.pathname === "/api/vendors" && request.method === "GET") {
        return await listVendors(env);
      }

      if (url.pathname === "/api/invoices" && request.method === "GET") {
        return await listInvoices(env);
      }

      if (url.pathname === "/api/payables" && request.method === "GET") {
        return await listPayables(env);
      }

      if (url.pathname === "/api/payments" && request.method === "GET") {
        return await listPayments(env);
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

      if (url.pathname === "/api/donor-portal/profile" && request.method === "GET") {
        return await getDonorProfile(request, env);
      }

      if (url.pathname === "/api/donor-portal/profile" && request.method === "PATCH") {
        return await updateDonorProfile(request, env);
      }

      if (url.pathname === "/api/donor-portal/donations" && request.method === "GET") {
        return await listDonorDonations(request, env);
      }

      if (url.pathname === "/api/donor-portal/receipts" && request.method === "GET") {
        return await listDonorReceipts(request, env);
      }

      if (url.pathname === "/api/donor-portal/shipping" && request.method === "GET") {
        return await listDonorShipping(request, env);
      }

      if (url.pathname === "/api/donor-portal/feedback" && request.method === "GET") {
        return await listDonorFeedback(request, env);
      }

      if (url.pathname === "/api/donor-portal/feedback" && request.method === "POST") {
        return await createDonorFeedback(request, env);
      }

      if (url.pathname === "/api/public/donations" && request.method === "POST") {
        return await createDonation(request, env);
      }

      if (url.pathname === "/api/public/feedback" && request.method === "POST") {
        return await createFeedback(request, env);
      }

      if (url.pathname === "/api/employee-portal/dashboard" && request.method === "GET") {
        return await getEmployeeDashboard(request, env);
      }

      if (url.pathname === "/api/employee-portal/schedule" && request.method === "GET") {
        return await listEmployeeSchedule(request, env);
      }

      if (url.pathname === "/api/employee-portal/events" && request.method === "GET") {
        return await listEmployeeEvents(request, env);
      }

      if (url.pathname === "/api/employee-portal/donations" && request.method === "GET") {
        return await listEmployeeDonations(request, env);
      }

      if (url.pathname === "/api/employee-portal/shippings" && request.method === "GET") {
        return await listEmployeeShippings(request, env);
      }

      if (url.pathname === "/api/employee-portal/feedback" && request.method === "GET") {
        return await listEmployeeFeedback(request, env);
      }

      if (url.pathname === "/api/employee-portal/me" && request.method === "GET") {
        return await getEmployeeProfile(request, env);
      }

      if (url.pathname === "/api/employee-portal/me" && request.method === "PATCH") {
        return await updateEmployeeProfile(request, env);
      }

      if (url.pathname === "/api/employee-portal/password" && request.method === "PATCH") {
        return await updateEmployeePassword(request, env);
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
          "/api/admin-analytics/:moduleKey/metadata",
          "/api/admin-analytics/:moduleKey/query",
          "/api/employees",
          "/api/schedules",
          "/api/donors",
          "/api/donation-receivables",
          "/api/receipts",
          "/api/shippings",
          "/api/feedback",
          "/api/donation-kits",
          "/api/books",
          "/api/envelopes",
          "/api/boxes",
          "/api/promotion-inventory",
          "/api/events",
          "/api/promotion-assets",
          "/api/vendors",
          "/api/invoices",
          "/api/payables",
          "/api/payments",
          "/api/public/events",
          "/api/auth/login",
          "/api/donor-auth/register",
          "/api/donor-auth/login",
          "/api/donor-portal/profile",
          "/api/donor-portal/donations",
          "/api/donor-portal/receipts",
          "/api/donor-portal/shipping",
          "/api/donor-portal/feedback",
          "/api/public/donations",
          "/api/public/feedback",
          "/api/employee-portal/dashboard",
          "/api/employee-portal/schedule",
          "/api/employee-portal/events",
          "/api/employee-portal/donations",
          "/api/employee-portal/shippings",
          "/api/employee-portal/feedback",
          "/api/employee-portal/me",
          "/api/employee-portal/password",
        ],
      });
    } catch (error) {
      return failure(error.message || "Request failed.", error.statusCode || 500, {
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
};
