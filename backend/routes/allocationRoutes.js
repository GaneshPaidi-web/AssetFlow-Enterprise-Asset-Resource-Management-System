const express = require('express');
const router = express.Router();
const allocationController = require('../controllers/allocationController');

router.get('/', allocationController.getAllAllocations);
router.post('/', allocationController.createAllocation);
router.post('/:id/return', allocationController.returnAllocation);

module.exports = router;
