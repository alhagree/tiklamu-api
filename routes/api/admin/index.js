//backend\routes\api\admin\index.js
const express = require("express");
const router = express.Router();
const verifyToken = require("../../../middleware/verifyToken");

router.use("/login", require("./login")); // بدون توكن
router.use("/clients", verifyToken, require("./clients"));
router.use("/subscriptions", verifyToken, require("./subscriptions"));
router.use("/dashboard", verifyToken, require("./dashboard"));
router.use("/users", verifyToken, require("./users"));
router.use("/visits", verifyToken, require("./visits"));
router.use("/levels", verifyToken, require("./levels"));

router.use("/imagekit", verifyToken, require("./imagekit")); // ✅ هذا هو المطلوب


module.exports = router;