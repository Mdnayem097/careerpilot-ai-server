import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Resume from '../models/Resume';
import CareerRoadmap from '../models/CareerRoadmap';
import CareerItem from '../models/CareerItem';

export const getDashboardAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userId = req.user.userId;

    // Fetch user items & AI records
    const totalItems = await CareerItem.countDocuments({ status: 'active' });
    const userCreatedItems = await CareerItem.countDocuments({ userId });
    const latestResume = await Resume.findOne({ userId }).sort({ createdAt: -1 });
    const latestRoadmap = await CareerRoadmap.findOne({ userId }).sort({ createdAt: -1 });

    // 1. ATS Progression History Trend Data
    const resumeHistory = await Resume.find({ userId }).sort({ createdAt: 1 }).limit(6);
    const atsTrend = resumeHistory.length > 0
      ? resumeHistory.map((r, i) => ({
          month: `Eval ${i + 1}`,
          atsScore: r.atsScore,
          keywordsMatch: r.extractedSkills.length * 10
        }))
      : [
          { month: 'Jan', atsScore: 58, keywordsMatch: 40 },
          { month: 'Feb', atsScore: 64, keywordsMatch: 52 },
          { month: 'Mar', atsScore: 72, keywordsMatch: 65 },
          { month: 'Apr', atsScore: 81, keywordsMatch: 78 },
          { month: 'May', atsScore: 89, keywordsMatch: 85 },
          { month: 'Jun', atsScore: 94, keywordsMatch: 92 }
        ];

    // 2. Skill Gap Radar Chart Data
    const skillRadar = [
      { subject: 'TypeScript/JS', current: 90, target: 95, fullMark: 100 },
      { subject: 'Next.js 15', current: 85, target: 90, fullMark: 100 },
      { subject: 'Agentic AI Systems', current: 75, target: 90, fullMark: 100 },
      { subject: 'System Design', current: 70, target: 85, fullMark: 100 },
      { subject: 'MongoDB / DB Indexing', current: 82, target: 88, fullMark: 100 },
      { subject: 'CI/CD & Deployment', current: 78, target: 85, fullMark: 100 }
    ];

    // 3. Application Pipeline Conversion Bar Data
    const pipelineFunnel = [
      { stage: 'Discovered', count: 24, fill: '#6366f1' },
      { stage: 'Applied', count: 16, fill: '#8b5cf6' },
      { stage: 'Interviewing', count: 7, fill: '#ec4899' },
      { stage: 'Tech Round', count: 4, fill: '#06b6d4' },
      { stage: 'Offer Stage', count: 2, fill: '#10b981' }
    ];

    return res.json({
      summary: {
        careerReadinessScore: latestRoadmap ? latestRoadmap.readinessScore : 84,
        atsScore: latestResume ? latestResume.atsScore : 89,
        targetRole: latestRoadmap ? latestRoadmap.targetRole : 'Senior AI Systems Engineer',
        totalItems,
        userCreatedItems,
        skillsMasteredCount: latestResume ? latestResume.extractedSkills.length : 14
      },
      atsTrend,
      skillRadar,
      pipelineFunnel
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error generating analytics', error: error.message });
  }
};
