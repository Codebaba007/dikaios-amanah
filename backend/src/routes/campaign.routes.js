const express = require('express');
const { createCampaign, getCampaigns } = require('../controllers/campaign.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/', authenticate, authorize(['BUSINESS_OWNER']), createCampaign);
router.get('/', authenticate, authorize(['BUSINESS_OWNER']), getCampaigns);

module.exports = router;
