const express = require('express');
const {
  getPendingVerifications,
  reviewVerification,
  getPendingCampaigns,
  reviewCampaign,
  getAuditRecords,
  verifyLedger
} = require('../controllers/admin.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

// Strict RBAC applied to all routes in this router
router.use(authenticate, authorize(['ADMINISTRATOR']));

router.get('/verifications/pending', getPendingVerifications);
router.post('/verifications/:verificationId/review', reviewVerification);

router.get('/campaigns/pending', getPendingCampaigns);
router.post('/campaigns/:campaignId/review', reviewCampaign);

// Audit & Trust Layer
router.get('/audits', getAuditRecords);
router.get('/audits/verify', verifyLedger);

module.exports = router;
