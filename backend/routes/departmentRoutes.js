const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');

router.get('/', departmentController.getAllDepartments);
router.post('/', departmentController.createDepartment);
router.patch('/:id', departmentController.updateDepartment);
router.patch('/:id/deactivate', departmentController.deactivateDepartment);

module.exports = router;
