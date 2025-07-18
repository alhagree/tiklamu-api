// Route For Item
const express = require("express");
const router = express.Router();
const fs = require("fs");
const multer = require("multer");
const verifyToken = require("../../../middleware/verifyToken");
const controller = require("../../../controllers/agent/ItemsController");

// إعداد رفع ديناميكي حسب link_code
function getUploadMiddleware() {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const link_code = req.user?.link_code || "default"; // ← ✅ هنا التعديل
      const dir = `./uploads/items/${link_code}`;
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

// ✅ عرض كل الأصناف
router.get("/", verifyToken, controller.getAllItems);

// ✅ عرض صنف
router.get("/:id", verifyToken, controller.getOneItem);

// ✅ إضافة صنف
router.post("/", verifyToken, getUploadMiddleware(), controller.createItem);

// ✅ تعديل صنف
router.put("/:id", verifyToken, getUploadMiddleware(), controller.updateItem);

// ✅ حذف صنف
router.delete("/:id", verifyToken, controller.deleteItem);

module.exports = router; 