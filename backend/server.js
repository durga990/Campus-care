import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { connectDB, closeDB } from './config/db.js';
import routes from './routes/index.js';
import { notFound, errorHandler } from './middleware/error.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

if (!process.env.CLIENT_URL) {
  process.env.CLIENT_URL = '*';
}
for (const key of ['MONGO_URI', 'JWT_SECRET']) {
  if (!process.env[key]) { console.error(`Missing required env var ${key}. See .env.example.`); process.exit(1); }
}
if (process.env.JWT_SECRET.length < 32) { console.error('JWT_SECRET must be at least 32 characters.'); process.exit(1); }

const app = express();
app.set('trust proxy', 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
const allowedOrigins = (process.env.CLIENT_URL || '').split(',').map((o) => o.trim().replace(/\/$/, ''));
const localDev = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/; // any local port in development (Vite may pick 5174, etc.)
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) return cb(null, true);
    if (process.env.NODE_ENV !== 'production' && localDev.test(origin)) return cb(null, true);
    return cb(null, true); // Permissive in deployment to avoid CORS lockouts, secured by JWT
  },
  credentials: true
}));
app.use(express.json({ limit: '100kb' }));
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, limit: 600, standardHeaders: true, legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please slow down.', errors: [] } }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), { maxAge: '7d', index: false }));
app.get('/api/health', (_req, res) => res.json({ success: true, message: 'CampusCare API is running', data: {} }));
app.use('/api', routes);

// Serve frontend dist if available (turnkey deployment on single service like Render / Railway)
const distPath = path.resolve(__dirname, '../frontend/dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 5000;
let server;
try {
  await connectDB();
  server = app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
} catch (err) {
  console.error('Failed to connect to MongoDB:', err.message);
  process.exit(1);
}
const shutdown = async (sig) => {
  console.log(`${sig} received, shutting down...`);
  server.close(async () => { await closeDB(); process.exit(0); });
};
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
