const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createCampaign = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { title, description, fundingGoal } = req.body;

    // Check verification status
    const business = await prisma.business.findUnique({
      where: { ownerId: userId }
    });

    if (!business) {
      return res.status(404).json({ error: 'Business profile not found.' });
    }

    if (business.verificationStatus !== 'APPROVED') {
      return res.status(403).json({
        error: `Campaign creation blocked. Your verification status is ${business.verificationStatus}.`
      });
    }

    const campaign = await prisma.campaign.create({
      data: {
        title,
        description,
        fundingGoal,
        businessId: business.id,
        status: 'PENDING' // Requires admin approval
      }
    });

    res.status(201).json({ message: 'Campaign submitted for approval', campaign });
  } catch (error) {
    next(error);
  }
};

exports.getCampaigns = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const business = await prisma.business.findUnique({
      where: { ownerId: userId },
      include: { campaigns: true }
    });

    if (!business) return res.status(404).json({ error: 'Business not found' });

    res.json(business.campaigns);
  } catch (error) {
    next(error);
  }
};
