import CareerRoadmap, { ICareerRoadmap } from "../models/CareerRoadmap";
import { Types } from "mongoose";
import { geminiService } from "./gemini.service";
import Resume from "../models/Resume";

interface CareerRecommendationInput {
  userId: string;
  currentRole: string;
  targetRole: string;
  pacing?: string;
}

export const runAgenticCareerRecommender = async (
  input: CareerRecommendationInput,
): Promise<ICareerRoadmap> => {
  const {
    userId,
    currentRole,
    targetRole,
    pacing = "Standard (6 months)",
  } = input;

  // 1. Fetch Previous Memory Context from DB
  const latestResume = await Resume.findOne({
    userId,
  }).sort({ createdAt: -1 });

  const pastRoadmap = await CareerRoadmap.findOne({
    userId,
    targetRole,
  }).sort({ createdAt: -1 });

  const memoryContext = {
    previousSkillGaps:
      latestResume?.skillGap ||
      pastRoadmap?.memoryContext?.previousSkillGaps ||
      [],

    extractedSkills: latestResume?.extractedSkills || [],

    atsScore: latestResume?.atsScore || 0,

    preferredPacing: pacing,

    lastEvaluationDate: new Date(),
  };

  // 2. Execute Gemini Agentic AI Recommendation Engine with Memory
  const geminiResult = await geminiService.generateCareerRecommendation(
    currentRole,
    targetRole,
    pacing,
    memoryContext,
  );

  // 3. Update Memory Context
  const updatedMemory = {
    previousSkillGaps: geminiResult.updatedSkillGaps,

    extractedSkills: latestResume?.extractedSkills || [],

    atsScore: latestResume?.atsScore || 0,

    preferredPacing: pacing,

    lastEvaluationDate: new Date(),
  };

  // 4. Create MongoDB Record
  const newRoadmap = await CareerRoadmap.create({
    userId: new Types.ObjectId(userId),
    currentRole,
    targetRole,
    reasoningChain: geminiResult.reasoningChain,
    readinessScore: geminiResult.readinessScore,
    milestones: geminiResult.milestones,
    memoryContext: updatedMemory,
  });

  return newRoadmap;
};
