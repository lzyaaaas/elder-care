const { verifyToken } = require("../utils/jwt");

function authenticateAny(req, _res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    const error = new Error("Authentication required.");
    error.statusCode = 401;
    return next(error);
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    req.user = verifyToken(token);
    next();
  } catch (_error) {
    const error = new Error("Invalid or expired token.");
    error.statusCode = 401;
    next(error);
  }
}

function authenticate(req, _res, next) {
  authenticateAny(req, _res, (error) => {
    if (error) {
      return next(error);
    }

    if (req.user?.accountType !== "ADMIN") {
      const authError = new Error("Admin access required.");
      authError.statusCode = 403;
      return next(authError);
    }

    return next();
  });
}

function authenticateDonor(req, _res, next) {
  authenticateAny(req, _res, (error) => {
    if (error) {
      return next(error);
    }

    if (req.user?.accountType !== "DONOR") {
      const authError = new Error("Donor access required.");
      authError.statusCode = 403;
      return next(authError);
    }

    return next();
  });
}

function authenticateEmployee(req, _res, next) {
  authenticateAny(req, _res, (error) => {
    if (error) {
      return next(error);
    }

    if (!["ADMIN", "EMPLOYEE"].includes(req.user?.accountType)) {
      const authError = new Error("Employee access required.");
      authError.statusCode = 403;
      return next(authError);
    }

    return next();
  });
}

module.exports = { authenticate, authenticateDonor, authenticateEmployee };
