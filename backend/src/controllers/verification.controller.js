const { PrismaClient } = require('@prisma/client');
const { calculateFileHash } = require('../services/storage.service');
const TrustLayerService = require('../services/trust.service');

const prisma = new PrismaClient();

exports.submitVerification = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { verificationType } = req.body;

    // Validate Business Exists
    const business = await prisma.business.findUnique({
      where: { ownerId: userId }
    });

    if (!business) {
      return res.status(404).json({ error: 'Business profile not found. Create one first.' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Supporting document is required.' });
    }

    // Process file
    const fileHash = await calculateFileHash(req.file.path);

    // Create Verification and Document atomically
    const verification = await prisma.$transaction(async (tx) => {
      const v = await tx.verification.create({
        data: {
          verificationType: verificationType || 'BUSINESS',
          businessId: business.id,
          status: 'PENDING'
        }
      });

      await tx.document.create({
        data: {
          fileName: req.file.originalname,
          fileType: req.file.mimetype,
          storageReference: req.file.path, // Local path for academic MVP
          integrityHash: fileHash,
          verificationId: v.id
        }
      });

      // Update Business Status to PENDING
      await tx.business.update({
        where: { id: business.id },
        data: { verificationStatus: 'PENDING' }
      });

      // Create AuditRecord via TrustLayer
      await TrustLayerService.recordEvent(tx, {
        eventType: 'VERIFICATION_SUBMITTED',
        entityId: v.id,
        userId: userId
      });

      return v;
    });

    res.status(201).json({ message: 'Verification submitted successfully.', verification });
  } catch (error) {
    next(error);
  }
};
