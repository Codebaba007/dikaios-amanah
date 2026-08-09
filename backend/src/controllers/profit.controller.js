const { PrismaClient } = require('@prisma/client');
const TrustLayerService = require('../services/trust.service');
const prisma = new PrismaClient();

exports.declareProfit = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { campaignId, amount, period } = req.body;

    // Verify ownership of the campaign
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { business: true }
    });

    if (!campaign || campaign.business.ownerId !== userId) {
      return res.status(403).json({ error: 'Not authorized to declare profit for this campaign.' });
    }

    const profit = await prisma.profitDeclaration.create({
      data: {
        campaignId,
        amount,
        period,
        status: 'PENDING'
      }
    });

    // Audit Log
    await TrustLayerService.recordEvent(prisma, {
      eventType: 'PROFIT_DECLARED',
      entityId: profit.id,
      userId: userId
    });

    res.status(201).json({ message: 'Profit declared successfully', profit });
  } catch (error) {
    next(error);
  }
};
