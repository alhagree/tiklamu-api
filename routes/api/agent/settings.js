//backend\routes\api\agent\settings.js
const express = require("express");
const router = express.Router();
const verifyToken = require("../../../middleware/verifyToken");
const controller = require("../../../controllers/agent/SettingsController");
const multer = require("multer");

// رفع صور متعددة (logo & background)
const upload = multer({ storage: multer.memoryStorage() }).fields([
  { name: "logo", maxCount: 1 },
  { name: "background", maxCount: 1 },
]);

// ✅ جلب الإعدادات
router.get("/", verifyToken, controller.getSettings);

router.get("/subscription", verifyToken, controller.getFullSettingsWithSubscription);

// ✅ تعديل الإعدادات
router.put("/", verifyToken, upload, controller.updateSettings);

module.exports = router;
