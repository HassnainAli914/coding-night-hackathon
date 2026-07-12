import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dns from 'dns';
import { config } from './config';
import { logger } from './utils/logger';
import { generalLimiter } from './middleware/rateLimiter';
import { requestSanitizer } from './middleware/requestSanitizer';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import apiRoutes from './routes';

// ─── Configure DNS Resolution Order ────────────────
// Forces Node.js 18+ to resolve IPv4 addresses first.
// This resolves the "TypeError: fetch failed" when connecting to Supabase on IPv4-only networks.
dns.setDefaultResultOrder('ipv4first');

// ─── Create Express App ──────────────────────────

const app = express();

// ─── Security Middleware ─────────────────────────

// Helmet — sets various HTTP security headers
app.use(helmet());

// CORS — configure allowed origins
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, etc.)
      if (!origin) {
        return callback(null, true);
      }

      const allowedOrigins = config.cors.origins;

      // Allow localhost, 127.0.0.1, or local network IPs (e.g. 192.168.x.x, 10.x.x.x, 172.16-31.x.x) on any port
      const isLocal =
        /^http:\/\/localhost(:\d+)?$/.test(origin) ||
        /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin) ||
        /^http:\/\/192\.168\.\d+\.\d+(:\d+)?$/.test(origin) ||
        /^http:\/\/10\.\d+\.\d+\.\d+(:\d+)?$/.test(origin) ||
        /^http:\/\/172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+(:\d+)?$/.test(origin);

      // Allow Vercel deployments (e.g. https://assets-frontend-flame.vercel.app)
      const isVercel = origin.startsWith('https://') && origin.endsWith('.vercel.app');

      if (isLocal || isVercel || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);


// ─── Parsing Middleware ──────────────────────────

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Request Processing ─────────────────────────

// Rate limiting (general)
app.use(generalLimiter);

// Request sanitization
app.use(requestSanitizer);

// HTTP request logging
app.use(
  morgan('short', {
    stream: {
      write: (message: string) => logger.info(message.trim()),
    },
  })
);

// ─── Root & Health Check ─────────────────────────

app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: '🚀 ServiceWala API is live',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      users: '/api/users',
    },
  });
});

app.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'ServiceWala API is running',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// Handle favicon.ico requests silently
app.get('/favicon.ico', (_req, res) => res.status(204).end());

// ─── API Routes ──────────────────────────────────

app.use('/api', apiRoutes);

// ─── Error Handling ──────────────────────────────

// 404 handler for unmatched routes
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// ─── Start Server (local development only) ──────
// On Vercel, the app is exported as a serverless function — no listen() needed.

if (!process.env.VERCEL) {
  const server = app.listen(config.port, () => {
    logger.info(`
  ╔═══════════════════════════════════════════════╗
  ║     🚀 ServiceWala API Server                 ║
  ║     Port:        ${String(config.port).padEnd(27)}║
  ║     Environment: ${config.nodeEnv.padEnd(27)}║
  ║     Health:      http://localhost:${config.port}/health  ║
  ╚═══════════════════════════════════════════════╝
    `);
  });

  // ─── Graceful Shutdown ───────────────────────────

  const gracefulShutdown = (signal: string) => {
    logger.info(`\n${signal} received. Shutting down gracefully...`);
    server.close(() => {
      logger.info('Server closed. Process exiting.');
      process.exit(0);
    });

    // Force close after 10s
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason);
});
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
});

// ─── Export for Vercel ───────────────────────────
export default app;

