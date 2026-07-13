const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const routes = require("./routes");
const errorHandler = require("./middleware/error.middleware");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Root Health check alias
app.get("/", (req, res) => {
  res.redirect("/api/v1/health");
});

// Mount Routes
app.use("/api/v1", routes);
app.use("/health", (req, res) => res.redirect("/api/v1/health"));

// Global Error Handler
app.use(errorHandler);

module.exports = app;
