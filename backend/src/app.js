/**
 * Express application factory.
 *
 * Kept separate from server.js so the same app can be mounted by a plain
 * Node process (local dev, Render, Docker) or a serverless handler without
 * duplicating route, CORS or error-handling logic.
 */

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

// One client per process/isolate — never per request.
const prisma = new PrismaClient();

const app = express();

// Behind Render/Vercel/nginx the client IP arrives in X-Forwarded-For.
app.set('trust proxy', 1);

/**
 * CORS: explicit allow-list in production, permissive only for local dev.
 * FRONTEND_URL accepts a comma-separated list so a Vercel preview deployment
 * and the production domain can both be authorised.
 */
const configuredOrigins = (process.env.FRONTEND_URL || process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim().replace(/\/$/, ''))
  .filter(Boolean);

const allowVercelPreviews = process.env.ALLOW_VERCEL_PREVIEWS !== 'false';

const corsOptions = {
  origin(origin, callback) {
    // Same-origin, server-to-server and curl requests have no Origin header.
    if (!origin) return callback(null, true);

    const normalised = origin.replace(/\/$/, '');
    const isLocalhost = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(normalised);
    const isConfigured = configuredOrigins.includes(normalised);
    const isVercelPreview = allowVercelPreviews && /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(normalised);

    if (isConfigured || isVercelPreview || (isLocalhost && process.env.NODE_ENV !== 'production')) {
      return callback(null, true);
    }

    return callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/profit', profitRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/investor', investorRoutes);

/**
 * Health check that actually proves the database is reachable.
 * Hosting platforms and uptime monitors must not see "ok" while the database
 * is down, otherwise a broken deployment looks healthy.
 */
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ok',
      message: 'Backend is running',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check database failure:', error.message);
    res.status(503).json({
      status: 'degraded',
      message: 'Backend is running but the database is unreachable',
      database: 'disconnected',
      timestamp: new Date().toISOString()
    });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` });
});

app.use(errorHandler);

module.exports = app;
module.exports.prisma = prisma;
