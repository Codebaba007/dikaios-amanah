const { PrismaClient } = require('@prisma/client');
const { calculateFileHash } = require('../services/storage.service');
const TrustLayerService = require('../services/trust.service');

const prisma = new PrismaClient();

// Submit investor identity verification
exports.submitInvestorVerification = async (req, res, next) => {
  try {
    const investorId = req.user.userId;

    if (!req.file) {
      return res.status(400).json({ error: 'Supporting document is required.' });
    }

    // Process file
    const fileHash = await calculateFileHash(req.file.path);

    // Create InvestorVerification and InvestorDocument atomically
    const verification = await prisma.$transaction(async (tx) => {
      const v = await tx.investorVerification.create({
        data: {
          investorId,
          status: 'PENDING'
        }
      });

      await tx.investorDocument.create({
        data: {
          fileName: req.file.originalname,
          fileType: req.file.mimetype,
          storageReference: req.file.path, // Local path for academic MVP
          integrityHash: fileHash,
          verificationId: v.id
        }
      });

      // Create AuditRecord via TrustLayer
      await TrustLayerService.recordEvent(tx, {
        eventType: 'INVESTOR_VERIFICATION_SUBMITTED',
        entityId: v.id,
        userId: investorId
      });

      return v;
    });

    res.status(201).json({ message: 'Verification submitted successfully.', verification });
  } catch (error) {
    next(error);
  }
};

// Get current investor verification status
exports.getInvestorVerificationStatus = async (req, res, next) => {
  try {
    const investorId = req.user.userId;

    const verification = await prisma.investorVerification.findFirst({
      where: { investorId },
      orderBy: { submittedAt: 'desc' },
      include: { documents: true }
    });

    if (!verification) {
      return res.json({ status: 'NOT_SUBMITTED', verification: null });
    }

    res.json({ status: verification.status, verification });
  } catch (error) {
    next(error);
  }
};
