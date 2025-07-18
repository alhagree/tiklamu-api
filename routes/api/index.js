//backend\routes\api\index.js
const express = require("express");
const router = express.Router();

router.use("/admin", require("./admin"));
router.use("/agent", require("./agent"));
router.use("/public", require("./public")); // إذا عندك مسارات عامة

module.exports = router;
