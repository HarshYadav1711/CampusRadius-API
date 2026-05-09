require("dotenv").config();

const express = require("express");
const cors = require("cors");

const routes = require("./src/routes");
const { notFound, internalError } = require("./src/utils/response");

const app = express();

app.disable("x-powered-by");

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "1mb" }));

app.use("/", routes);

app.use((req, res) => {
  notFound(res, "Route not found");
});

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const isProduction = process.env.NODE_ENV === "production";

  console.error("[request failed]", {
    method: req.method,
    path: req.originalUrl,
    message: err.message,
    ...(isProduction ? {} : { stack: err.stack }),
  });

  const clientMessage = isProduction
    ? "Internal server error"
    : err.message || "Internal server error";

  internalError(res, clientMessage);
});

module.exports = app;
