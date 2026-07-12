const express = require('express');
const router = express.Router();
const transferController = require('../controllers/transferController');

router.get('/', transferController.getAllTransfers);
router.post('/', transferController.createTransfer);
router.post('/:id/approve', transferController.approveTransfer);
router.post('/:id/reject', transferController.rejectTransfer);

module.exports = router;
