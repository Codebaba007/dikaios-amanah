const express = require('express');
const { submitVerification } = require('../controllers/verification.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { uploadSingle } = require('../services/storage.service');

const router = express.Router();

router.post('/submit', authenticate, authorize(['BUSINESS_OWNER']), uploadSingle('document'), submitVerification);

module.exports = router;
