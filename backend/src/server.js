require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const authRoutes = require('./routes/auth.routes');
const businessRoutes = require('./routes/business.routes');
const verificationRoutes = require('./routes/verification.routes');
const campaignRoutes = require('./routes/campaign.routes');
const profitRoutes = require('./routes/profit.routes');
const adminRoutes = require('./routes/admin.routes');
const investorRoutes = require('./routes/investor.routes');
const { errorHandler } = require('./middlewares/error.middleware');

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/profit', profitRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/investor', investorRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit();
});
