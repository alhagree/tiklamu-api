// ✅ backend/routes/api/agent/dashboard.js
const express = require("express");
const router = express.Router();
const DashboardController = require("../../../controllers/agent/DashboardController");
const verifyToken = require("../../../middleware/verifyToken");

router.get("/", verifyToken, DashboardController.getDashboardData); // ✅ نمرر فقط الدالة المطلوبة

module.exports = router; // ✅ تصدير راوتر جاهز