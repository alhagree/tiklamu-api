//backend\routes\api\index.js
const express = require("express");
const router = express.Router();

// ✅ اختبار الاتصال
router.get("/test", (req, res) => {
  res.status(200).json({ success: true, message: "API is working 🎉" });
});

router.use("/admin", require("./admin"));
router.use("/agent", require("./agent"));
router.use("/public", require("./public")); // إذا عندك مسارات عامة

module.exports = router;
