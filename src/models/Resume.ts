import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IResume extends Document {
  userId: Types.ObjectId;
  rawText: string;
  targetRole: string;
  atsScore: number;
  extractedSkills: string[];
  missingKeywords: string[];
  strengthPoints: string[];
  improvementSuggestions: {
    section: string;
    issue: string;
    recommendation: string;
    revisedText: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const ResumeSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rawText: { type: String, required: true },
    targetRole: { type: String, required: true },
    atsScore: { type: Number, required: true, default: 75 },
    extractedSkills: [{ type: String }],
    missingKeywords: [{ type: String }],
    strengthPoints: [{ type: String }],
    improvementSuggestions: [
      {
        section: { type: String },
        issue: { type: String },
        recommendation: { type: String },
        revisedText: { type: String }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model<IResume>('Resume', ResumeSchema);
