// backend/routes/api/admin/subscribeRequests.js
const express = require("express");
const router = express.Router();
const controller = require("../../../controllers/admin/SubscribeRequestsController");

router.get("/", controller.getAll);
router.put("/:id", controller.updateStatus);

module.exports = router;
