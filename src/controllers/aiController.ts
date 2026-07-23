import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { runAgenticResumeAnalyzer } from '../services/agenticResumeService';
import { runAgenticCareerRecommender } from '../services/agenticCareerService';
import { processChatMessage, getUserConversations } from '../services/aiChatService';
import Resume from '../models/Resume';
import CareerRoadmap from '../models/CareerRoadmap';

export const analyzeResume = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { rawText, targetRole } = req.body;

    if (!rawText || !targetRole) {
      return res.status(400).json({ message: 'Resume text and target role are required' });
    }

    const analysis = await runAgenticResumeAnalyzer({
      userId: req.user.userId,
      rawText,
      targetRole
    });

    return res.json({ message: 'Resume analyzed successfully', analysis });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error analyzing resume', error: error.message });
  }
};

export const getResumeHistory = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const resumes = await Resume.find({ userId: req.user.userId }).sort({ createdAt: -1 });

    return res.json({ resumes });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching resume history', error: error.message });
  }
};

export const generateCareerRecommendation = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { currentRole, targetRole, pacing } = req.body;

    if (!currentRole || !targetRole) {
      return res.status(400).json({ message: 'Current role and target role are required' });
    }

    const roadmap = await runAgenticCareerRecommender({
      userId: req.user.userId,
      currentRole,
      targetRole,
      pacing
    });

    return res.json({ message: 'Career recommendation generated with memory', roadmap });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error generating career recommendation', error: error.message });
  }
};

export const getCareerRoadmaps = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const roadmaps = await CareerRoadmap.find({ userId: req.user.userId }).sort({ createdAt: -1 });

    return res.json({ roadmaps });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching career roadmaps', error: error.message });
  }
};

export const sendChatMessage = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { conversationId, message } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    const conversation = await processChatMessage({
      userId: req.user.userId,
      conversationId,
      message
    });

    return res.json({ message: 'Chat processed', conversation });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error processing chat message', error: error.message });
  }
};

export const getConversations = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const conversations = await getUserConversations(req.user.userId);

    return res.json({ conversations });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching chat conversations', error: error.message });
  }
};
