const express = require('express');
const router = express.Router();
const DashboardController = require('../../../controllers/admin/DashboardController');
const verifyToken = require('../../../middleware/verifyToken'); // أضف هذا

router.get("/", verifyToken, DashboardController.getStats); // أضف middleware هنا


module.exports = router;
