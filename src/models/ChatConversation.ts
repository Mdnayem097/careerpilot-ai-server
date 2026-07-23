import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMessage {
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  agentThinking?: string;
}

export interface IChatConversation extends Document {
  userId: Types.ObjectId;
  title: string;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema(
  {
    sender: { type: String, enum: ['user', 'assistant', 'system'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    agentThinking: { type: String }
  },
  { _id: false }
);

const ChatConversationSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, default: 'Career Strategy Session' },
    messages: [MessageSchema]
  },
  { timestamps: true }
);

export default mongoose.model<IChatConversation>('ChatConversation', ChatConversationSchema);
