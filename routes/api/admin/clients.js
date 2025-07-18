const express = require('express');
const router = express.Router();
const ClientsController = require('../../../controllers/admin/ClientsController');
const verifyToken = require("../../../middleware/verifyToken");

router.get("/", verifyToken, ClientsController.getAll);
router.get('/:id', ClientsController.getById);
router.post('/', ClientsController.add);
router.put('/:id', ClientsController.update);
router.delete('/:id', ClientsController.delete);
router.put('/disable/:id', ClientsController.disable);
router.put('/enable/:id', ClientsController.enable);
 

module.exports = router;
