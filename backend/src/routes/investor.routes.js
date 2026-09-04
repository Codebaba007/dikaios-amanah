const express = require('express');
const {
  getApprovedCampaigns,
  getCampaignDetails,
  makeInvestment,
  getPortfolio,
  getBusinesses,
  getBusinessDetail
} = require('../controllers/investor.controller');
const {
  submitInvestorVerification,
  getInvestorVerificationStatus
} = require('../controllers/investor-verification.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { upload } = require('../services/storage.service');

const router = express.Router();

// Strict RBAC: All investor routes must be authenticated and authorized as INVESTOR
router.use(authenticate, authorize(['INVESTOR']));

router.get('/campaigns', getApprovedCampaigns);
router.get('/campaigns/:campaignId', getCampaignDetails);
router.post('/invest', makeInvestment);
router.get('/portfolio', getPortfolio);
router.get('/businesses', getBusinesses);
router.get('/businesses/:businessId', getBusinessDetail);

// Investor verification
router.post('/verification/submit', upload.single('document'), submitInvestorVerification);
router.get('/verification/status', getInvestorVerificationStatus);

module.exports = router;

