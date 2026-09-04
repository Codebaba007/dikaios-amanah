const { PrismaClient } = require('@prisma/client');
const TrustLayerService = require('../services/trust.service');
const prisma = new PrismaClient();

// VERIFICATIONS

exports.getPendingVerifications = async (req, res, next) => {
  try {
    const verifications = await prisma.verification.findMany({
      where: { status: 'PENDING' },
      include: {
        business: {
          include: { owner: { select: { name: true, email: true } } }
        },
        documents: true
      }
    });
    res.json(verifications);
  } catch (error) {
    next(error);
  }
};

exports.reviewVerification = async (req, res, next) => {
  try {
    const adminId = req.user.userId;
    const { verificationId } = req.params;
    const { action, remarks } = req.body; // action: 'APPROVED' or 'REJECTED'

    if (!['APPROVED', 'REJECTED'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action. Must be APPROVED or REJECTED.' });
    }

    const verification = await prisma.verification.findUnique({
      where: { id: verificationId },
      include: { business: true }
    });

    if (!verification || verification.status !== 'PENDING') {
      return res.status(404).json({ error: 'Verification not found or not pending.' });
    }

    const result = await prisma.$transaction(async (tx) => {
      const v = await tx.verification.update({
        where: { id: verificationId },
        data: {
          status: action,
          reviewedAt: new Date(),
          remarks: remarks || null
        }
      });

      await tx.business.update({
        where: { id: verification.businessId },
        data: { verificationStatus: action }
      });

      await TrustLayerService.recordEvent(tx, {
        eventType: action === 'APPROVED' ? 'VERIFICATION_APPROVED' : 'VERIFICATION_REJECTED',
        entityId: verification.id,
        userId: adminId
      });

      await tx.notification.create({
        data: {
          userId: verification.business.ownerId,
          type: 'VERIFICATION',
          message: `Your business verification was ${action}.${remarks ? ` Reason: ${remarks}` : ''}`
        }
      });

      return v;
    });

    res.json({ message: `Verification ${action} successfully.`, verification: result });
  } catch (error) {
    next(error);
  }
};

// CAMPAIGNS

exports.getPendingCampaigns = async (req, res, next) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      where: { status: 'PENDING' },
      include: { business: true }
    });
    res.json(campaigns);
  } catch (error) {
    next(error);
  }
};

exports.reviewCampaign = async (req, res, next) => {
  try {
    const adminId = req.user.userId;
    const { campaignId } = req.params;
    const { action, remarks } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action.' });
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { business: true }
    });

    if (!campaign || campaign.status !== 'PENDING') {
      return res.status(404).json({ error: 'Campaign not found or not pending.' });
    }

    const result = await prisma.$transaction(async (tx) => {
      const c = await tx.campaign.update({
        where: { id: campaignId },
        data: { status: action === 'APPROVED' ? 'ACTIVE' : 'REJECTED' }
      });

      await TrustLayerService.recordEvent(tx, {
        eventType: action === 'APPROVED' ? 'CAMPAIGN_APPROVED' : 'CAMPAIGN_REJECTED',
        entityId: campaign.id,
        userId: adminId
      });

      await tx.notification.create({
        data: {
          userId: campaign.business.ownerId,
          type: 'CAMPAIGN',
          message: `Your campaign "${campaign.title}" was ${action}.${remarks ? ` Reason: ${remarks}` : ''}`
        }
      });

      return c;
    });

    res.json({ message: `Campaign reviewed successfully.`, campaign: result });
  } catch (error) {
    next(error);
  }
};

// AUDIT RECORDS

exports.getAuditRecords = async (req, res, next) => {
  try {
    const records = await prisma.auditRecord.findMany({
      orderBy: { timestamp: 'desc' },
      include: { user: { select: { name: true, email: true, role: true } } }
    });
    res.json(records);
  } catch (error) {
    next(error);
  }
};

exports.verifyLedger = async (req, res, next) => {
  try {
    const result = await TrustLayerService.verifyLedger();
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// INVESTOR VERIFICATIONS

exports.getPendingInvestorVerifications = async (req, res, next) => {
  try {
    const verifications = await prisma.investorVerification.findMany({
      where: { status: 'PENDING' },
      include: {
        investor: { select: { name: true, email: true } },
        documents: true
      }
    });
    res.json(verifications);
  } catch (error) {
    next(error);
  }
};

exports.reviewInvestorVerification = async (req, res, next) => {
  try {
    const adminId = req.user.userId;
    const { verificationId } = req.params;
    const { action, remarks } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action. Must be APPROVED or REJECTED.' });
    }

    const verification = await prisma.investorVerification.findUnique({
      where: { id: verificationId }
    });

    if (!verification || verification.status !== 'PENDING') {
      return res.status(404).json({ error: 'Investor verification not found or not pending.' });
    }

    const result = await prisma.$transaction(async (tx) => {
      const v = await tx.investorVerification.update({
        where: { id: verificationId },
        data: {
          status: action,
          reviewedAt: new Date(),
          remarks: remarks || null
        }
      });

      await TrustLayerService.recordEvent(tx, {
        eventType: action === 'APPROVED' ? 'INVESTOR_VERIFICATION_APPROVED' : 'INVESTOR_VERIFICATION_REJECTED',
        entityId: verification.id,
        userId: adminId
      });

      await tx.notification.create({
        data: {
          userId: verification.investorId,
          type: 'VERIFICATION',
          message: `Your investor verification was ${action}.${remarks ? ` Reason: ${remarks}` : ''}`
        }
      });

      return v;
    });

    res.json({ message: `Investor verification ${action} successfully.`, verification: result });
  } catch (error) {
    next(error);
  }
};

