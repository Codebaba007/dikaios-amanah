const express = require('express');
const { submitVerification } = require('../controllers/verification.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { upload } = require('../services/storage.service');

const router = express.Router();

router.post('/submit', authenticate, authorize(['BUSINESS_OWNER']), upload.single('document'), submitVerification);

module.exports = router;
