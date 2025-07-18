const express = require("express");
const router = express.Router();
const verifyToken = require("../../../middleware/verifyToken");

router.use("/login", require("./login")); // بدون توكن
router.use("/clients", verifyToken, require("./clients"));
router.use("/subscriptions", verifyToken, require("./subscriptions"));
router.use("/dashboard", verifyToken, require("./dashboard"));
router.use("/users", verifyToken, require("./users"));
router.use("/visits", verifyToken, require("./visits"));

module.exports = router;