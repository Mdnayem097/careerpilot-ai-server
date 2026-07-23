import { Router } from 'express';
import {
  analyzeResume,
  getResumeHistory,
  generateCareerRecommendation,
  getCareerRoadmaps,
  sendChatMessage,
  getConversations
} from '../controllers/aiController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);

router.post('/resume-analyzer', analyzeResume);
router.get('/resumes', getResumeHistory);

router.post('/career-recommendation', generateCareerRecommendation);
router.get('/roadmaps', getCareerRoadmaps);

router.post('/chat/message', sendChatMessage);
router.get('/chat/conversations', getConversations);

export default router;
