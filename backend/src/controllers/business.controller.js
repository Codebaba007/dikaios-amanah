const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createBusiness = async (req, res, next) => {
  try {
    const { businessName, description, industry } = req.body;
    const userId = req.user.userId;

    const existingBusiness = await prisma.business.findUnique({
      where: { ownerId: userId }
    });

    if (existingBusiness) {
      return res.status(400).json({ error: 'You already have a business profile.' });
    }

    const business = await prisma.business.create({
      data: {
        businessName,
        description,
        industry,
        ownerId: userId
      }
    });

    res.status(201).json(business);
  } catch (error) {
    next(error);
  }
};

exports.getBusiness = async (req, res, next) => {
  try {
    const business = await prisma.business.findUnique({
      where: { ownerId: req.user.userId },
      include: {
        verifications: true,
        campaigns: true
      }
    });

    if (!business) {
      return res.status(404).json({ error: 'Business profile not found.' });
    }

    res.json(business);
  } catch (error) {
    next(error);
  }
};
