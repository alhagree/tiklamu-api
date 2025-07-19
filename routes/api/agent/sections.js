const express = require("express");
const router = express.Router();
const verifyToken = require("../../../middleware/verifyToken");
const controller = require("../../../controllers/agent/sectionController");
const multer = require("multer");

// ✅ تخزين مؤقت للصور بالذاكرة لاستخدام ImageKit
const upload = multer({ storage: multer.memoryStorage() }).single("image");

// ✅ عرض الأقسام
router.get("/", verifyToken, controller.getSections);
router.get("/all", controller.getAllSections);

// ✅ إضافة قسم مع رفع صورة
router.post("/", verifyToken, upload, controller.addSection);

// ✅ عرض قسم للتعديل
router.get("/:id", verifyToken, controller.getSectionById);

// ✅ تعديل قسم مع رفع صورة جديدة إن وُجدت
router.put("/:id", verifyToken, upload, controller.updateSection);

// ✅ حذف قسم
router.delete("/:id", verifyToken, controller.deleteSection);

module.exports = router;
