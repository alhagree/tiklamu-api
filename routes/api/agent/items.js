// routes/api/agent/items.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const verifyToken = require("../../../middleware/verifyToken");
const controller = require("../../../controllers/agent/ItemsController");

// ✅ إعداد multer باستخدام memoryStorage
const upload = multer({ storage: multer.memoryStorage() }).single("image");

// ✅ عرض كل الأصناف
router.get("/", verifyToken, controller.getAllItems);

// ✅ عرض صنف
router.get("/:id", verifyToken, controller.getOneItem);

// ✅ إضافة صنف مع رفع صورة في الذاكرة
router.post("/", verifyToken, upload, controller.createItem);

// ✅ تعديل صنف مع رفع صورة في الذاكرة
router.put("/:id", verifyToken, upload, controller.updateItem);

// ✅ حذف صنف
router.delete("/:id", verifyToken, controller.deleteItem);

module.exports = router;
