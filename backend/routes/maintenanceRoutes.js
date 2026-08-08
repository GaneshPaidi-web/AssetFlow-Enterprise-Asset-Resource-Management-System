const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');

router.get('/', maintenanceController.getAllMaintenance);
router.post('/', maintenanceController.createMaintenanceRequest);
router.post('/:id/approve', maintenanceController.approveMaintenance);
router.patch('/:id/approve', maintenanceController.approveMaintenance);
router.post('/:id/reject', maintenanceController.rejectMaintenance);
router.patch('/:id/reject', maintenanceController.rejectMaintenance);
router.post('/:id/resolve', maintenanceController.resolveMaintenance);
router.patch('/:id/resolve', maintenanceController.resolveMaintenance);

module.exports = router;
