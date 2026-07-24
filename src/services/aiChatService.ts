import ChatConversation, {
  IChatConversation,
} from "../models/ChatConversation";
import { Types } from "mongoose";
import { geminiService } from "./gemini.service";
import Resume from "../models/Resume";
import CareerRoadmap from "../models/CareerRoadmap";

interface SendMessageInput {
  userId: string;
  conversationId?: string;
  message: string;
}

export const processChatMessage = async (input: SendMessageInput) => {
  const { userId, conversationId, message } = input;

  const latestResume = await Resume.findOne({
    userId,
  }).sort({ createdAt: -1 });

  const latestRoadmap = await CareerRoadmap.findOne({
    userId,
  }).sort({ createdAt: -1 });

  const contextSummary = `
ATS Score: ${latestResume?.atsScore ?? "Unknown"}

Target Role: ${latestResume?.targetRole ?? "Unknown"}

Extracted Skills:
${latestResume?.extractedSkills?.join(", ") ?? "None"}

Skill Gap:
${latestResume?.skillGap?.join(", ") ?? "None"}

Learning Roadmap:
${latestResume?.learningRoadmap?.join(", ") ?? "None"}

Recommended Careers:
${latestResume?.recommendedCareers?.join(", ") ?? "None"}

Career Readiness:
${latestRoadmap?.readinessScore ?? "Unknown"}

Current Career Target:
${latestRoadmap?.targetRole ?? "Unknown"}
`;

  let conversation: IChatConversation | null = null;

  if (conversationId) {
    conversation = await ChatConversation.findOne({
      _id: conversationId,
      userId,
    });
  }

  if (!conversation) {
    conversation = await ChatConversation.create({
      userId: new Types.ObjectId(userId),
      title: message.slice(0, 30) + "...",
      messages: [
        {
          sender: "system",
          content:
            "You are CareerPilot AI Assistant — an expert career coach, resume strategist, and technical interview advisor.",
          timestamp: new Date(),
        },
      ],
    });
  }

  // Add User Message
  conversation.messages.push({
    sender: "user",
    content: message,
    timestamp: new Date(),
  });

  // Call Gemini AI Service
  const { content, agentThinking } = await geminiService.generateChatResponse(
    contextSummary,
    conversation.messages,
    message,
  );

  // Add Assistant Response
  conversation.messages.push({
    sender: "assistant",
    content,
    timestamp: new Date(),
    agentThinking,
  });

  await conversation.save();

  return conversation;
};

export const getUserConversations = async (userId: string) => {
  return await ChatConversation.find({ userId }).sort({ updatedAt: -1 });
};
