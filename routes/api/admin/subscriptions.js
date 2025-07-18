const express = require('express');
const router = express.Router();
const SubscriptionsController = require('../../../controllers/admin/SubscriptionsController');

const verifyToken = require("../../../middleware/verifyToken");
router.use(verifyToken); // ← هذا يحمي كل الراوتات بالملف

router.get('/', SubscriptionsController.getAll);
router.get('/:id', SubscriptionsController.getById);
router.post('/', SubscriptionsController.add);
router.put('/:id', SubscriptionsController.update);
router.delete('/:id', SubscriptionsController.delete);


module.exports = router;