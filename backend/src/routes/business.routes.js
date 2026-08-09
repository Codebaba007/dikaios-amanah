const express = require('express');
const { createBusiness, getBusiness } = require('../controllers/business.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/', authenticate, authorize(['BUSINESS_OWNER']), createBusiness);
router.get('/', authenticate, authorize(['BUSINESS_OWNER']), getBusiness);

module.exports = router;
