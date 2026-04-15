const cors = require("cors");
const express = require("express");
const morgan = require("morgan");

const { env } = require("./config/env");
const apiRoutes = require("./routes");
const { errorHandler } = require("./middleware/error-handler");
const { notFound } = require("./middleware/not-found");

const app = express();

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "Server is healthy.",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api", apiRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = { app };
