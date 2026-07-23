import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICareerRoadmap extends Document {
  userId: Types.ObjectId;
  currentRole: string;
  targetRole: string;
  reasoningChain: string[];
  readinessScore: number;
  milestones: {
    phase: string;
    timeframe: string;
    skillsToAcquire: string[];
    actionItems: string[];
    completed: boolean;
  }[];
  memoryContext: {
    previousSkillGaps: string[];
    preferredPacing: string;
    lastEvaluationDate: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const CareerRoadmapSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    currentRole: { type: String, required: true },
    targetRole: { type: String, required: true },
    reasoningChain: [{ type: String }],
    readinessScore: { type: Number, default: 65 },
    milestones: [
      {
        phase: { type: String, required: true },
        timeframe: { type: String, required: true },
        skillsToAcquire: [{ type: String }],
        actionItems: [{ type: String }],
        completed: { type: Boolean, default: false }
      }
    ],
    memoryContext: {
      previousSkillGaps: [{ type: String }],
      preferredPacing: { type: String, default: 'Standard (6 months)' },
      lastEvaluationDate: { type: Date, default: Date.now }
    }
  },
  { timestamps: true }
);

export default mongoose.model<ICareerRoadmap>('CareerRoadmap', CareerRoadmapSchema);
