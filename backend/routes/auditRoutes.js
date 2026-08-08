const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');

router.get('/', auditController.getAllAudits);
router.post('/', auditController.createAuditCycle);
router.post('/:id/items', auditController.addAuditItem);
router.patch('/:id/close', auditController.closeAuditCycle);

module.exports = router;
