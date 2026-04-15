function errorHandler(error, _req, res, _next) {
  if (error.name === "ZodError") {
    return res.status(400).json({
      success: false,
      message: "Validation failed.",
      errors: error.flatten ? error.flatten() : error.issues,
    });
  }

  if (error.code === "P2002") {
    return res.status(409).json({
      success: false,
      message: "A unique field already exists.",
      meta: error.meta,
    });
  }

  if (error.code === "P2025") {
    return res.status(404).json({
      success: false,
      message: "Record not found.",
    });
  }

  const statusCode = error.statusCode || 500;

  return res.status(statusCode).json({
    success: false,
    message: error.message || "Internal server error.",
  });
}

module.exports = { errorHandler };
