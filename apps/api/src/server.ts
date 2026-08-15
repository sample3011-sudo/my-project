import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { PrismaClient } from '@prisma/client';

const app = express();
const PORT = process.env['PORT'] ?? 8080;

// Only connect Prisma if DATABASE_URL is set
const prisma = process.env['DATABASE_URL'] ? new PrismaClient() : null;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Basic health check (always works)
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// DB health check (only works if DATABASE_URL is set)
app.get('/health/db', async (_req, res) => {
  if (!prisma) {
    return res.status(503).json({ status: 'no_database', message: 'DATABASE_URL not configured' });
  }
  try {
    await prisma.$queryRaw`SELECT 1`;
    return res.json({ status: 'ok', database: 'connected' });
  } catch (err) {
    return res.status(503).json({ status: 'error', message: String(err) });
  }
});

// Sample: list users
app.get('/users', async (_req, res) => {
  if (!prisma) {
    return res.status(503).json({ error: 'DATABASE_URL not configured' });
  }
  try {
    const users = await prisma.user.findMany();
    return res.json(users);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
  console.log(`Database: ${prisma ? 'connected' : 'not configured (set DATABASE_URL)'}`);
});

export default app;
