import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash?: string;
  avatarUrl?: string;
  role: 'user' | 'admin';
  provider: 'credentials' | 'google' | 'demo';
  headline?: string;
  targetRole?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String },
    avatarUrl: { type: String, default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    provider: { type: String, enum: ['credentials', 'google', 'demo'], default: 'credentials' },
    headline: { type: String, default: 'Full Stack Engineer & AI Enthusiast' },
    targetRole: { type: String, default: 'Senior AI Engineer' }
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);
