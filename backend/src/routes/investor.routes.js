const express = require('express');
const {
  getApprovedCampaigns,
  getCampaignDetails,
  makeInvestment,
  getPortfolio,
  getBusinesses,
  getBusinessDetail
} = require('../controllers/investor.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

// Strict RBAC: All investor routes must be authenticated and authorized as INVESTOR
router.use(authenticate, authorize(['INVESTOR']));

router.get('/campaigns', getApprovedCampaigns);
router.get('/campaigns/:campaignId', getCampaignDetails);
router.post('/invest', makeInvestment);
router.get('/portfolio', getPortfolio);
router.get('/businesses', getBusinesses);
router.get('/businesses/:businessId', getBusinessDetail);

module.exports = router;
