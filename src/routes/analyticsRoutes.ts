import { Router } from 'express';
import { getDashboardAnalytics } from '../controllers/analyticsController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.get('/dashboard', authenticateJWT, getDashboardAnalytics);

export default router;
