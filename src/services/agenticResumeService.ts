import Resume, { IResume } from '../models/Resume';
import { Types } from 'mongoose';
import { geminiService } from './gemini.service';

interface AnalyzeResumeInput {
  userId: string;
  rawText: string;
  targetRole: string;
}

export const runAgenticResumeAnalyzer = async (input: AnalyzeResumeInput): Promise<IResume> => {
  const { userId, rawText, targetRole } = input;

  // 1. Call Gemini AI Service for ATS analysis and bullet rewriting
  const geminiResult = await geminiService.analyzeResume(rawText, targetRole);

  // 2. Save result to MongoDB
  const newResume = await Resume.create({
    userId: new Types.ObjectId(userId),
    rawText,
    targetRole,
    atsScore: geminiResult.atsScore,
    extractedSkills: geminiResult.extractedSkills,
    missingKeywords: geminiResult.missingKeywords,
    strengthPoints: geminiResult.strengthPoints,
    improvementSuggestions: geminiResult.improvementSuggestions
  });

  return newResume;
};
