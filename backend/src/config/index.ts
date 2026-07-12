import dotenv from 'dotenv';
import path from 'path';

// Load .env from the backend root (local development only).
// On Vercel, env vars are injected directly — no .env file needed.
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.resolve(__dirname, '../../.env') });
}

// ─── Required Environment Variables ─────────────

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`❌ Missing required environment variable: ${key}`);
  }
  return value;
}

function optionalEnv(key: string, fallback: string): string {
  return process.env[key] || fallback;
}

// ─── Exported Config ─────────────────────────────

export const config = {
  // Server
  port: parseInt(optionalEnv('PORT', '5000'), 10),
  nodeEnv: optionalEnv('NODE_ENV', 'development'),
  isProduction: optionalEnv('NODE_ENV', 'development') === 'production',

  // Supabase
  supabase: {
    url: requireEnv('SUPABASE_URL'),
    anonKey: requireEnv('SUPABASE_ANON_KEY'),
    serviceRoleKey: requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
    jwtSecret: requireEnv('JWT_SECRET'),
  },

  // SMTP Email Configurations
  smtp: {
    host: optionalEnv('SMTP_HOST', 'smtp.gmail.com'),
    port: parseInt(optionalEnv('SMTP_PORT', '587'), 10),
    user: optionalEnv('SMTP_USER', ''),
    pass: optionalEnv('SMTP_PASS', ''),
    fromName: optionalEnv('SMTP_FROM_NAME', 'ServiceWala'),
    fromEmail: optionalEnv('SMTP_FROM_EMAIL', ''),
  },

  // CORS
  cors: {
    origins: optionalEnv('CORS_ORIGIN', 'http://localhost:8081')
      .split(',')
      .map((s) => s.trim()),
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(optionalEnv('RATE_LIMIT_WINDOW_MS', '900000'), 10),
    max: parseInt(optionalEnv('RATE_LIMIT_MAX', '100'), 10),
  },

  // Logging
  logLevel: optionalEnv('LOG_LEVEL', 'debug'),
} as const;
