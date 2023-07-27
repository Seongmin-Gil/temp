const express = require("express");
const router = express.Router();
const { getTest } = require("./controller");

router.route("/test").get(getTest);

module.exports = router;
