require("dotenv").config();

const express = require("express");
const cors = require("cors");

const routes = require("./src/routes");
const { notFound, serverError } = require("./src/utils/response");

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
  notFound(res);
});

app.use((err, req, res, next) => {
  console.error(err);
  serverError(res);
});

module.exports = app;
