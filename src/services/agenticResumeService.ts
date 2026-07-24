import Resume, { IResume } from "../models/Resume";
import { Types } from "mongoose";
import { geminiService } from "./gemini.service";

interface AnalyzeResumeInput {
  userId: string;
  rawText: string;
  targetRole: string;
}

export const runAgenticResumeAnalyzer = async (
  input: AnalyzeResumeInput
): Promise<IResume> => {
  const { userId, rawText, targetRole } = input;

  // Step 1: ATS Resume Analysis
  const analysis = await geminiService.analyzeResume(
    rawText,
    targetRole
  );

  // Step 2: Career Roadmap Generation
  const roadmap = await geminiService.generateCareerRoadmap(
    rawText,
    targetRole
  );

  // Step 3: Save Everything
  const newResume = await Resume.create({
    userId: new Types.ObjectId(userId),

    rawText,
    targetRole,

    atsScore: analysis.atsScore,

    extractedSkills: analysis.extractedSkills,

    missingKeywords: analysis.missingKeywords,

    strengthPoints: analysis.strengthPoints,

    improvementSuggestions:
      analysis.improvementSuggestions,

    skillGap: roadmap.skillGap,

    learningRoadmap:
      roadmap.learningRoadmap,

    recommendedCareers:
      roadmap.recommendedCareers,

    interviewQuestions:
      roadmap.interviewQuestions,

    aiSummary:
      roadmap.aiSummary,
  });

  return newResume;
};