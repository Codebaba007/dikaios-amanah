const express = require('express');
const {
  getPendingVerifications,
  reviewVerification,
  getPendingCampaigns,
  reviewCampaign,
  getAuditRecords,
  verifyLedger,
  getPendingInvestorVerifications,
  reviewInvestorVerification
} = require('../controllers/admin.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

// Strict RBAC applied to all routes in this router
router.use(authenticate, authorize(['ADMINISTRATOR']));

router.get('/verifications/pending', getPendingVerifications);
router.post('/verifications/:verificationId/review', reviewVerification);

router.get('/campaigns/pending', getPendingCampaigns);
router.post('/campaigns/:campaignId/review', reviewCampaign);

// Investor verifications
router.get('/investor-verifications/pending', getPendingInvestorVerifications);
router.post('/investor-verifications/:verificationId/review', reviewInvestorVerification);

// Audit & Trust Layer
router.get('/audits', getAuditRecords);
router.get('/audits/verify', verifyLedger);

module.exports = router;

