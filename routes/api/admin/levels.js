// levels.js
const express = require("express");
const router = express.Router();
const LevelsController = require("../../../controllers/admin/LevelsController");
const verifyToken = require('../../../middleware/verifyToken'); // أضف هذا

router.get("/",verifyToken, LevelsController.getAll);

module.exports = router;