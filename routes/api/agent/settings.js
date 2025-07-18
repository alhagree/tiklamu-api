// backend\routes\api\agent\settings.js
const express = require("express");
const router = express.Router();
const fs = require("fs");
const multer = require("multer");
const verifyToken = require("../../../middleware/verifyToken");
const controller = require("../../../controllers/agent/SettingsController");

// ✅ إعداد رفع شعار وخلفية ديناميكي حسب link_code
function getUploadMiddleware() {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const link_code = req.user?.link_code || "default";
      const dir = `./uploads/settings/${link_code}`;
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const uniqueName = Date.now() + "-" + file.originalname;
      cb(null, uniqueName);
    },
  });

  return multer({ storage }).fields([
    { name: "logo", maxCount: 1 },
    { name: "background", maxCount: 1 },
  ]);
}

// ✅ عرض تفاصيل الاشتراك (اسم العميل، رقم الهاتف، المدة...)
router.get("/subscription", verifyToken, controller.getSubscriptionDetails); 

// routes/api/agent/clients.js أو مشابه
router.put('/me', verifyToken, controller.updateClientInfo);

// ✅ رفع صور الإعدادات (شعار، خلفية)
router.post(
  "/upload-images",
  verifyToken,
  getUploadMiddleware(),
  controller.uploadSettingsImages
);

module.exports = router;
