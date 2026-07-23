import { Router } from 'express';
import { registerUser, loginUser, demoLogin, getMe } from '../controllers/authController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/demo-login', demoLogin);
router.get('/me', authenticateJWT, getMe);

export default router;
