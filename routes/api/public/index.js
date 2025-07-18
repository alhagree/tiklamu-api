//backend\routes\api\public\index.js
const express = require("express");
const router = express.Router();

const menuRoutes = require("./menu");
router.use("/menu", menuRoutes);

module.exports = router;
