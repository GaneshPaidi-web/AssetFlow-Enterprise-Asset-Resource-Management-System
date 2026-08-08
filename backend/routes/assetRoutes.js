const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');

router.get('/', assetController.getAllAssets);
router.get('/:id', assetController.getAssetById);
router.get('/:id/history', assetController.getAssetHistory);
router.post('/', assetController.createAsset);
router.patch('/:id/status', assetController.updateAssetStatus);

module.exports = router;
