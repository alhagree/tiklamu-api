//backend\routes\api\admin\visits.js
const express = require("express");
const router = express.Router();
const VisitController = require("../../../controllers/admin/VisitController");
const verifyToken = require("../../../middleware/verifyToken");

// إحصائيات الزيارات (رسم بياني)
router.get("/", verifyToken, VisitController.getVisitsPerDay);

module.exports = router;
