import CareerRoadmap, { ICareerRoadmap } from '../models/CareerRoadmap';
import { Types } from 'mongoose';
import { geminiService } from './gemini.service';

interface CareerRecommendationInput {
  userId: string;
  currentRole: string;
  targetRole: string;
  pacing?: string;
}

export const runAgenticCareerRecommender = async (input: CareerRecommendationInput): Promise<ICareerRoadmap> => {
  const { userId, currentRole, targetRole, pacing = 'Standard (6 months)' } = input;

  // 1. Fetch Previous Memory Context from DB
  const pastRoadmap = await CareerRoadmap.findOne({ userId, targetRole }).sort({ createdAt: -1 });
  const memoryContext = pastRoadmap?.memoryContext || {
    previousSkillGaps: [],
    preferredPacing: pacing,
    lastEvaluationDate: new Date()
  };

  // 2. Execute Gemini Agentic AI Recommendation Engine with Memory
  const geminiResult = await geminiService.generateCareerRecommendation(
    currentRole,
    targetRole,
    pacing,
    memoryContext
  );

  // 3. Update Memory Context
  const updatedMemory = {
    previousSkillGaps: geminiResult.updatedSkillGaps || ['Agentic AI', 'System Design'],
    preferredPacing: pacing,
    lastEvaluationDate: new Date()
  };

  // 4. Create MongoDB Record
  const newRoadmap = await CareerRoadmap.create({
    userId: new Types.ObjectId(userId),
    currentRole,
    targetRole,
    reasoningChain: geminiResult.reasoningChain,
    readinessScore: geminiResult.readinessScore,
    milestones: geminiResult.milestones,
    memoryContext: updatedMemory
  });

  return newRoadmap;
};
