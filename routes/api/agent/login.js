const express = require("express");
const router = express.Router();
const loginController = require("../../../controllers/agent/LoginController");

router.post("/", loginController.login);

module.exports = router; 