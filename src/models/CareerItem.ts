import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICareerItem extends Document {
  userId: Types.ObjectId;
  title: string;
  category: 'Job Listing' | 'Skill Pathway' | 'Learning Resource' | 'Mentorship';
  companyOrProvider: string;
  location: string;
  type: 'Full-time' | 'Remote' | 'Contract' | 'Course' | 'Certification';
  salaryOrCost: string;
  experienceLevel: 'Entry-Level' | 'Mid-Level' | 'Senior' | 'Executive';
  description: string;
  requirements: string[];
  skillsRequired: string[];
  applicationUrl?: string;
  status: 'active' | 'archived' | 'draft';
  createdAt: Date;
  updatedAt: Date;
}

const CareerItemSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    category: {
      type: String,
      enum: ['Job Listing', 'Skill Pathway', 'Learning Resource', 'Mentorship'],
      default: 'Job Listing'
    },
    companyOrProvider: { type: String, required: true },
    location: { type: String, required: true, default: 'Remote' },
    type: {
      type: String,
      enum: ['Full-time', 'Remote', 'Contract', 'Course', 'Certification'],
      default: 'Full-time'
    },
    salaryOrCost: { type: String, required: true },
    experienceLevel: {
      type: String,
      enum: ['Entry-Level', 'Mid-Level', 'Senior', 'Executive'],
      default: 'Senior'
    },
    description: { type: String, required: true },
    requirements: [{ type: String }],
    skillsRequired: [{ type: String }],
    applicationUrl: { type: String },
    status: { type: String, enum: ['active', 'archived', 'draft'], default: 'active' }
  },
  { timestamps: true }
);

export default mongoose.model<ICareerItem>('CareerItem', CareerItemSchema);
