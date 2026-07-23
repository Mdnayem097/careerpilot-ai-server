import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/db';

import authRoutes from './routes/authRoutes';
import itemRoutes from './routes/itemRoutes';
import aiRoutes from './routes/aiRoutes';
import analyticsRoutes from './routes/analyticsRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect Database
connectDB();

// Middlewares
app.use(cors({ origin: '*', credentials: true }));
app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Base Route & Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'CareerPilot AI REST API',
    timestamp: new Date().toISOString()
  });
});

// REST API v1 Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/career-items', itemRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/analytics', analyticsRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: `Cannot ${req.method} ${req.originalUrl}` });
});

app.listen(PORT, () => {
  console.log(`🚀 CareerPilot AI Express Server running on http://localhost:${PORT}`);
});
