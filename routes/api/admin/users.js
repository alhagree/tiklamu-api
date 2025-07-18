const express = require('express');
const router = express.Router();
const UsersController = require('../../../controllers/admin/UsersController');

router.get('/by-client/:id', UsersController.getByClientId);

module.exports = router;
