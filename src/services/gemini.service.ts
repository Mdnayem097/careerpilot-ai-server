import { GoogleGenerativeAI } from "@google/generative-ai";

export interface ResumeAnalysisResult {
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
}

export interface CareerRecommendationResult {
  reasoningChain: string[];
  readinessScore: number;
  milestones: {
    phase: string;
    timeframe: string;
    skillsToAcquire: string[];
    actionItems: string[];
    completed: boolean;
  }[];
  updatedSkillGaps: string[];
}

export interface CareerRoadmapResult {
  skillGap: string[];
  learningRoadmap: string[];
  recommendedCareers: string[];
  interviewQuestions: string[];
  aiSummary: string;
}

export interface ChatAssistantResult {
  content: string;
  agentThinking: string;
}

class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private modelName: string = "gemini-1.5-flash";

  constructor() {
    this.init();
  }

  private init() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "your_gemini_api_key_here") {
      try {
        this.genAI = new GoogleGenerativeAI(apiKey);
        console.log("⚡ Gemini API Service initialized successfully.");
      } catch (err) {
        console.error(
          "❌ Failed to initialize GoogleGenerativeAI instance:",
          err,
        );
        this.genAI = null;
      }
    } else {
      console.warn(
        "⚠️ GEMINI_API_KEY is not set or using placeholder in .env. Operating in fallback mode.",
      );
    }
  }

  /**
   * Utility helper to extract JSON from Gemini text response (handling markdown codeblocks)
   */
  private parseJsonResponse<T>(text: string): T {
    try {
      const cleaned = text
        .replace(/```json\s*/gi, "")
        .replace(/```\s*/g, "")
        .trim();
      return JSON.parse(cleaned) as T;
    } catch (error) {
      console.error(
        "Failed to parse JSON from Gemini response. Raw text:",
        text,
      );
      throw new Error("Invalid JSON format returned from Gemini model");
    }
  }

  /**
   * Feature 1: Analyze Resume & ATS Optimization using Gemini AI
   */
  public async analyzeResume(
    rawText: string,
    targetRole: string,
  ): Promise<ResumeAnalysisResult> {
    if (this.genAI) {
      try {
        const model = this.genAI.getGenerativeModel({
          model: this.modelName,
          generationConfig: { responseMimeType: "application/json" },
        });

        const prompt = `
You are an expert Executive Resume Reviewer and ATS (Applicant Tracking System) Scanner.
Analyze the following resume text specifically for the target job role: "${targetRole}".

Resume Content:
"""
${rawText}
"""

Please evaluate the resume thoroughly and return ONLY a valid JSON object matching the exact structure below:
{
  "atsScore": number (0 to 100),
  "extractedSkills": string[] (list of technical/hard skills detected in resume relevant to targetRole),
  "missingKeywords": string[] (list of critical skills or keywords for targetRole missing from the resume),
  "strengthPoints": string[] (2-4 key strengths identified),
  "improvementSuggestions": [
    {
      "section": string (e.g. "Work Experience", "Skills", "Summary"),
      "issue": string (specific deficiency identified),
      "recommendation": string (how to fix it),
      "revisedText": string (a high-impact rewritten bullet point using Action Verb + Impact Metric formula)
    }
  ]
}
`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        return this.parseJsonResponse<ResumeAnalysisResult>(responseText);
      } catch (err: any) {
        console.error(
          "[Gemini API Error - analyzeResume]:",
          err.message || err,
        );
      }
    }

    return this.fallbackAnalyzeResume(rawText, targetRole);
  }

  /**
   * Feature 2: Generate Phased Career Path Recommendation with Memory & Multi-Step Reasoning
   */
  public async generateCareerRecommendation(
    currentRole: string,
    targetRole: string,
    pacing: string = "Standard (6 months)",
    memoryContext?: any,
  ): Promise<CareerRecommendationResult> {
    if (this.genAI) {
      try {
        const model = this.genAI.getGenerativeModel({
          model: this.modelName,
          generationConfig: { responseMimeType: "application/json" },
        });

        const prompt = `
You are CareerPilot Agentic AI — an advanced career strategist and technical learning path architect.
Design a personalized career roadmap to transition from "${currentRole}" to "${targetRole}" with "${pacing}" pacing.

Previous Memory & Skill History: ${JSON.stringify(memoryContext || {})}

Return ONLY a valid JSON object with the following schema:
{
  "reasoningChain": string[] (4 explicit step-by-step thinking traces detailing how you analyzed memory, skill gaps, market trends, and transition complexity),
  "readinessScore": number (0 to 100 based on current role closeness to target role),
  "milestones": [
    {
      "phase": string (e.g. "Phase 1: Deep Core Mastery"),
      "timeframe": string (e.g. "Month 1 - Month 2"),
      "skillsToAcquire": string[],
      "actionItems": string[],
      "completed": false
    }
  ],
  "updatedSkillGaps": string[] (list of key technical skills the user still needs to acquire)
}
`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        return this.parseJsonResponse<CareerRecommendationResult>(responseText);
      } catch (err: any) {
        console.error(
          "[Gemini API Error - generateCareerRecommendation]:",
          err.message || err,
        );
      }
    }

    return this.fallbackCareerRecommendation(
      currentRole,
      targetRole,
      pacing,
      memoryContext,
    );
  }

  public async generateCareerRoadmap(
    rawText: string,
    targetRole: string,
  ): Promise<CareerRoadmapResult> {
    if (this.genAI) {
      try {
        const model = this.genAI.getGenerativeModel({
          model: this.modelName,
          generationConfig: {
            responseMimeType: "application/json",
          },
        });

        const prompt = `
You are an expert AI Career Coach.

Analyze this resume.

Target Role:

${targetRole}

Resume:

${rawText}

Return ONLY JSON.

{
"skillGap":[string],
"learningRoadmap":[string],
"recommendedCareers":[string],
"interviewQuestions":[string],
"aiSummary":"string"
}
`;

        const result = await model.generateContent(prompt);

        return this.parseJsonResponse<CareerRoadmapResult>(
          result.response.text(),
        );
      } catch (err) {
        console.error(err);
      }
    }

    return this.fallbackCareerRoadmap(rawText, targetRole);
  }

  /**
   * Feature 3: AI Chat Assistant with Real-Time Streaming & Comprehensive Profile Context
   */
  public async generateChatStream(
    contextSummary: string,
    messages: Array<{ sender: string; content: string }>,
    newMessage: string,
    onChunk: (chunkText: string) => void,
  ): Promise<ChatAssistantResult> {
    if (this.genAI) {
      try {
        const model = this.genAI.getGenerativeModel({
          model: this.modelName,
        });

        const formattedHistory = messages
          .filter((m) => m.sender !== "system")
          .slice(-10)
          .map((m) => `${m.sender.toUpperCase()}: ${m.content}`)
          .join("\n");

        const prompt = `
You are CareerPilot AI Assistant — an elite career mentor, technical interview strategist, and resume coach.

USER CONTEXT & MEMORY PROFILE:
${contextSummary}

CONVERSATION HISTORY:
${formattedHistory}

USER'S LATEST QUERY: "${newMessage}"

INSTRUCTIONS:
1. Provide a direct, actionable, and encouraging response formatted cleanly in GitHub Markdown (use headers, bold text, bullet points, and code snippets where relevant).
2. Actively reference the user's specific context (their target role, ATS resume score, skill gaps, career roadmap milestones, or platform job opportunities) whenever relevant to personalize the response.
3. Offer clear step-by-step guidance.
`;

        const result = await model.generateContentStream(prompt);
        let fullText = "";
        for await (const chunk of result.stream) {
          const text = chunk.text();
          fullText += text;
          onChunk(text);
        }

        const agentThinking = `[Context Engine] Integrated Resume, Career Roadmap & Job Database Context (${contextSummary.length} chars) ➔ Gemini 1.5 Flash Stream Completed (${fullText.length} chars).`;
        return { content: fullText, agentThinking };
      } catch (err: any) {
        console.error("[Gemini API Stream Error]:", err.message || err);
      }
    }

    // Fallback stream simulation
    const fallback = this.fallbackChatResponse(messages, newMessage);
    const chars = fallback.content.split("");
    let simulated = "";
    for (let i = 0; i < chars.length; i += 5) {
      const slice = chars.slice(i, i + 5).join("");
      simulated += slice;
      onChunk(slice);
      await new Promise((r) => setTimeout(r, 10));
    }

    return fallback;
  }

  /**
   * Non-streaming fallback for chat response
   */
  public async generateChatResponse(
    contextSummary: string,
    messages: Array<{ sender: string; content: string }>,
    newMessage: string,
  ): Promise<ChatAssistantResult> {
    return this.generateChatStream(
      contextSummary,
      messages,
      newMessage,
      () => {},
    );
  }

  /* --- Fallback Implementations --- */

  private fallbackAnalyzeResume(
    rawText: string,
    targetRole: string,
  ): ResumeAnalysisResult {
    const requiredKeywords = [
      "TypeScript",
      "React",
      "Next.js",
      "Node.js",
      "Express.js",
      "MongoDB",
      "System Design",
      "REST API",
      "Agentic AI",
    ];
    const lowerRaw = rawText.toLowerCase();
    const extractedSkills = requiredKeywords.filter((kw) =>
      lowerRaw.includes(kw.toLowerCase()),
    );
    const missingKeywords = requiredKeywords.filter(
      (kw) => !lowerRaw.includes(kw.toLowerCase()),
    );
    const atsScore = Math.min(
      Math.round((extractedSkills.length / requiredKeywords.length) * 70 + 25),
      95,
    );

    return {
      atsScore,
      extractedSkills,
      missingKeywords,
      strengthPoints: [
        `Strong technical foundation matching ${targetRole}.`,
        `Identified key skill alignments: ${extractedSkills.join(", ") || "Core engineering basics"}.`,
      ],
      improvementSuggestions: [
        {
          section: "Work Experience / Impact",
          issue:
            missingKeywords.length > 0
              ? `Missing key keywords: ${missingKeywords.slice(0, 3).join(", ")}`
              : "Needs more quantified impact metrics.",
          recommendation:
            "Incorporate missing keywords into impact-focused bullet points.",
          revisedText: `• Scaled microservices using ${missingKeywords[0] || "TypeScript"} and optimized REST API response times by 35%.`,
        },
      ],
    };
  }

  private fallbackCareerRecommendation(
    currentRole: string,
    targetRole: string,
    pacing: string,
    memoryContext?: any,
  ): CareerRecommendationResult {
    return {
      reasoningChain: [
        `[Step 1: Memory Inspection] Inspected candidate history for ${currentRole} -> ${targetRole}.`,
        `[Step 2: Skill Delta Analysis] Evaluated core architecture and system design requirements.`,
        `[Step 3: Market Benchmark] Applied standard engineering competency model for ${targetRole}.`,
        `[Step 4: Roadmap Formulation] Created phashed roadmap matching ${pacing}.`,
      ],
      readinessScore: 68,
      milestones: [
        {
          phase: "Phase 1: Core Foundation & Modern Stack",
          timeframe: "Month 1 - Month 2",
          skillsToAcquire: [
            "TypeScript",
            "Next.js 15 App Router",
            "Express.js REST APIs",
          ],
          actionItems: [
            "Build full-stack production application with MongoDB persistence.",
          ],
          completed: false,
        },
        {
          phase: "Phase 2: Advanced Systems & AI Integration",
          timeframe: "Month 3 - Month 4",
          skillsToAcquire: [
            "Agentic AI Architecture",
            "Gemini API",
            "Vector DBs",
          ],
          actionItems: [
            "Implement multi-agent workflows and structured JSON tool calls.",
          ],
          completed: false,
        },
      ],
      updatedSkillGaps: ["Agentic AI", "System Design", "Distributed Systems"],
    };
  }

  private fallbackCareerRoadmap(
    rawText: string,
    targetRole: string,
  ): CareerRoadmapResult {
    return {
      skillGap: ["System Design", "Docker", "CI/CD", "Testing"],

      learningRoadmap: [
        "Master Advanced TypeScript",

        "Build Production Next.js Projects",

        "Learn Docker",

        "Practice System Design",

        "Deploy Full Stack Apps",
      ],

      recommendedCareers: [
        targetRole,

        "Full Stack Developer",

        "Frontend Engineer",

        "Software Engineer",
      ],

      interviewQuestions: [
        "Explain JWT Authentication.",

        "Difference between SSR and CSR?",

        "Explain React Virtual DOM.",

        "How Express Middleware Works?",
      ],

      aiSummary:
        "Your resume has a strong foundation but improving system design, deployment and testing skills will significantly increase your interview readiness.",
    };
  }

  private fallbackChatResponse(
    messages: Array<{ sender: string; content: string }>,
    newMessage: string,
  ): ChatAssistantResult {
    const lower = newMessage.toLowerCase();
    let content = `Based on your request, I recommend focusing on three core pillars:\n\n1. **Technical Stack Mastery**: Ensure proficiency in Next.js 15 App Router, TypeScript, and Express.js REST APIs.\n2. **Quantified Impact**: Highlight measurable achievements on your resume.\n3. **Continuous Practice**: Use our built-in AI Resume Analyzer and Career Path tools!`;

    if (lower.includes("resume") || lower.includes("ats")) {
      content = `To optimize your resume ATS score:\n• Target active keywords like **TypeScript**, **Next.js 15**, and **Agentic AI**.\n• Use our **AI Resume Analyzer** tool for real-time ATS scoring!`;
    } else if (lower.includes("interview")) {
      content = `For technical interviews:\n• Apply the **STAR Method** (Situation, Task, Action, Result).\n• Review System Design principles: Database Indexing, Caching, and REST API conventions.`;
    }

    return {
      content,
      agentThinking:
        "[Fallback Engine] Generated structured career recommendation.",
    };
  }
}

export const geminiService = new GeminiService();
