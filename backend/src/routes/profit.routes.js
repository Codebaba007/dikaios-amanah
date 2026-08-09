const express = require('express');
const { declareProfit } = require('../controllers/profit.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/', authenticate, authorize(['BUSINESS_OWNER']), declareProfit);

module.exports = router;
