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
    const [rows] = await connection.execute(
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
    const [rows] = await connection.execute(
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

    const [existingRows] = await connection.execute(
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
      await connection.execute(
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
      const [result] = await connection.execute(
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

    const [donorRows] = await connection.execute(
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
    const [rows] = await connection.execute(
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

    await connection.execute("UPDATE donors SET last_login_at = NOW() WHERE id = ?", [donor.id]);

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
      const [existingRows] = await connection.execute(
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
      await connection.execute(
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
      const [donorResult] = await connection.execute(
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
    const [donationResult] = await connection.execute(
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

    const [donationRows] = await connection.execute(
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
      const [donationRows] = await connection.execute(
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
    const [result] = await connection.execute(
      `INSERT INTO feedback (
        donation_id, feedback_content, rating, feedback_date, status
      ) VALUES (?, ?, ?, ?, 'NEW')`,
      [finalDonationId, feedbackContent, safeRating, feedbackDate],
    );

    const [rows] = await connection.execute("SELECT * FROM feedback WHERE id = ? LIMIT 1", [
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
