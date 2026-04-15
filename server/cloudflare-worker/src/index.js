import mysql from "mysql2/promise";

function json(data, init = {}) {
  return new Response(JSON.stringify(data, null, 2), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...(init.headers || {}),
    },
  });
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

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/" || url.pathname === "/api/health") {
      return json({
        success: true,
        service: "elder-care-api",
        message: "Worker is running.",
        timestamp: new Date().toISOString(),
      });
    }

    if (url.pathname === "/api/health/db") {
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
        return json(
          {
            success: false,
            message: "Database connection failed.",
            error: error instanceof Error ? error.message : "Unknown error",
          },
          { status: 500 },
        );
      } finally {
        if (connection) {
          ctx.waitUntil(connection.end());
        }
      }
    }

    if (url.pathname === "/api/health/tables") {
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
        return json(
          {
            success: false,
            message: "Could not read database tables.",
            error: error instanceof Error ? error.message : "Unknown error",
          },
          { status: 500 },
        );
      } finally {
        if (connection) {
          ctx.waitUntil(connection.end());
        }
      }
    }

    return json(
      {
        success: false,
        message: "Route not found.",
        availableRoutes: ["/api/health", "/api/health/db", "/api/health/tables"],
      },
      { status: 404 },
    );
  },
};
