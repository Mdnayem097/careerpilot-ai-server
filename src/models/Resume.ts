import mongoose, { Schema, Document, Types } from "mongoose";

export interface IImprovementSuggestion {
  section: string;
  issue: string;
  recommendation: string;
  revisedText: string;
}

export interface IResume extends Document {
  userId: Types.ObjectId;

  rawText: string;
  targetRole: string;

  atsScore: number;

  extractedSkills: string[];

  missingKeywords: string[];

  strengthPoints: string[];

  improvementSuggestions: IImprovementSuggestion[];

  // Agentic AI Fields

  skillGap: string[];

  learningRoadmap: string[];

  recommendedCareers: string[];

  interviewQuestions: string[];

  aiSummary: string;

  createdAt: Date;

  updatedAt: Date;
}

const ResumeSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    rawText: {
      type: String,
      required: true,
    },

    targetRole: {
      type: String,
      required: true,
    },

    atsScore: {
      type: Number,
      default: 75,
    },

    extractedSkills: [
      {
        type: String,
      },
    ],

    missingKeywords: [
      {
        type: String,
      },
    ],

    strengthPoints: [
      {
        type: String,
      },
    ],

    improvementSuggestions: [
      {
        section: String,

        issue: String,

        recommendation: String,

        revisedText: String,
      },
    ],

    // Agentic AI

    skillGap: [
      {
        type: String,
        default: [],
      },
    ],

    learningRoadmap: [
      {
        type: String,
        default: [],
      },
    ],

    recommendedCareers: [
      {
        type: String,
        default: [],
      },
    ],

    interviewQuestions: [
      {
        type: String,
        default: [],
      },
    ],

    aiSummary: {
      type: String,
      default: "",
    },
  },

  {
    timestamps: true,
  }
);

export default mongoose.model<IResume>(
  "Resume",
  ResumeSchema
);