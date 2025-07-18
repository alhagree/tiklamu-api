// route section.js
const express = require("express");
const router = express.Router();
const fs = require("fs");
const multer = require("multer");
const verifyToken = require("../../../middleware/verifyToken");
const sectionController = require("../../../controllers/agent/sectionController");

// إعداد upload ديناميكي حسب link_code 
function getUploadMiddleware() {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const link_code = req.user?.link_code || "default"; // ← ✅ هنا التعديل
      console.log("📥 1 :", link_code);
      const dir = `./uploads/sections/${link_code}`;
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const uniqueName = Date.now() + "-" + file.originalname;
      cb(null, uniqueName);
    },
  });

  return multer({ storage }).single("image");
}

// ✅ عرض كل الأقسام (يتطلب تسجيل الدخول)
router.get("/", verifyToken, sectionController.getSections);

// ✅ عرض عام للأقسام (بدون توكن) مثلاً لواجهة الزبون أو صفحة عامة
// router.get("/public", sectionController.getAllSections); ← فعّل فقط إذا عندك دالة بهالاسم

router.get("/all", sectionController.getAllSections);

// ✅ إضافة قسم
router.post("/", verifyToken, getUploadMiddleware(), sectionController.addSection);

// ✅ عرض قسم للتعديل
router.get("/:id", verifyToken, sectionController.getSectionById);

// ✅ تعديل قسم
router.put("/:id", verifyToken, getUploadMiddleware(), sectionController.updateSection);

router.delete("/:id", verifyToken, sectionController.deleteSection);

module.exports = router;
