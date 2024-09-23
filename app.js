const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();
const router = require("./router");

const createApp = () => {
  const app = express();
  app.use(cors());
  app.use(morgan("dev"));
  app.use(express.json());
  app.use(router);
  app.get("/ping", (req, res) => {
    res.json({ message: "pong" });
  });
  return app;
};

module.exports = { createApp };
