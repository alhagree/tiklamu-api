const express = require('express');
const router = express.Router();
const LoginController = require('../../../controllers/admin/LoginController');

router.post('/', LoginController.login);

module.exports = router;
