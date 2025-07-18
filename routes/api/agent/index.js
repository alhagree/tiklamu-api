const express = require("express");
const router = express.Router();
const verifyToken = require("../../../middleware/verifyToken");

router.use("/login", require("./login")); // بدون توكن
router.use("/sections", verifyToken, require("./sections"));
router.use("/items", verifyToken, require("./items"));
router.use("/dashboard", require("./dashboard"));
router.use("/settings", require("./settings"));


module.exports = router; 