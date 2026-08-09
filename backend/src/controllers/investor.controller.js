const { PrismaClient } = require('@prisma/client');
const TrustLayerService = require('../services/trust.service');
const prisma = new PrismaClient();

// Get active campaigns for discovery
exports.getApprovedCampaigns = async (req, res, next) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      where: { status: 'ACTIVE' },
      include: {
        business: { select: { businessName: true, industry: true } }
      }
    });
    res.json(campaigns);
  } catch (error) {
    next(error);
  }
};

// Get specific campaign details
exports.getCampaignDetails = async (req, res, next) => {
  try {
    const { campaignId } = req.params;

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        business: { select: { businessName: true, description: true, industry: true } },
        profitDeclarations: {
          where: { status: 'APPROVED' } // Only show approved profits (assuming admin clears them, or just show all pending/approved for now, let's show all for simplicity unless specified otherwise. We will show all for transparency.)
        }
      }
    });

    if (!campaign || campaign.status !== 'ACTIVE') {
      return res.status(404).json({ error: 'Campaign not found or not eligible for investment.' });
    }

    res.json(campaign);
  } catch (error) {
    next(error);
  }
};

// Make a simulated investment
exports.makeInvestment = async (req, res, next) => {
  try {
    const investorId = req.user.userId;
    const { campaignId, amount } = req.body;

    const investmentAmount = parseFloat(amount);
    if (isNaN(investmentAmount) || investmentAmount <= 0) {
      return res.status(400).json({ error: 'Invalid investment amount.' });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch campaign and lock row if necessary (using a simple read here is fine for the MVP, but ideally SELECT FOR UPDATE)
      const campaign = await tx.campaign.findUnique({
        where: { id: campaignId },
        include: { business: true }
      });

      // 2. Validate campaign exists and is ACTIVE
      if (!campaign || campaign.status !== 'ACTIVE') {
        throw new Error('Campaign not found or not eligible for investment.');
      }

      // 3. Validate capacity
      const currentFunding = parseFloat(campaign.currentFunding);
      const fundingGoal = parseFloat(campaign.fundingGoal);
      if (currentFunding + investmentAmount > fundingGoal) {
        throw new Error('Investment exceeds remaining campaign capacity.');
      }

      // 4. Create Investment
      const investment = await tx.investment.create({
        data: {
          amount: investmentAmount,
          campaignId: campaign.id,
          investorId: investorId,
          status: 'COMPLETED' // Simulated as instant
        }
      });

      // 5. Update Campaign progress
      await tx.campaign.update({
        where: { id: campaign.id },
        data: { currentFunding: { increment: investmentAmount } }
      });

      // 6. Create AuditRecord
      await TrustLayerService.recordEvent(tx, {
        eventType: 'INVESTMENT_SIMULATED',
        entityId: investment.id,
        userId: investorId
      });

      await tx.notification.create({
        data: {
          userId: investorId,
          type: 'INVESTMENT',
          message: `You successfully invested $${investmentAmount} in ${campaign.title}.`
        }
      });
      await tx.notification.create({
        data: {
          userId: campaign.business.ownerId,
          type: 'INVESTMENT',
          message: `Your campaign "${campaign.title}" received a new investment of $${investmentAmount}.`
        }
      });

      return investment;
    });

    res.status(201).json({ message: 'Investment successful.', investment: result });
  } catch (error) {
    if (error.message.includes('exceeds') || error.message.includes('not found')) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

// Get Investor Portfolio
exports.getPortfolio = async (req, res, next) => {
  try {
    const investorId = req.user.userId;

    // An investor can ONLY see their own investments.
    const investments = await prisma.investment.findMany({
      where: { investorId },
      include: {
        campaign: {
          include: { business: { select: { businessName: true } } }
        }
      },
      orderBy: { investedAt: 'desc' }
    });

    res.json(investments);
  } catch (error) {
    next(error);
  }
};
