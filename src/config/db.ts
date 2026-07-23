import mongoose from 'mongoose';
import User from '../models/User';
import CareerItem from '../models/CareerItem';
import bcrypt from 'bcryptjs';

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/careerpilot';
    console.log(`Connecting to MongoDB...`);
    await mongoose.connect(mongoUri);
    console.log(`✅ MongoDB Connected successfully.`);

    // Seed Demo User if not exists
    let demoUser = await User.findOne({ email: 'demo@careerpilot.ai' });
    if (!demoUser) {
      const passwordHash = await bcrypt.hash('DemoPassword123!', 10);
      demoUser = await User.create({
        name: 'Alex Rivera (Demo)',
        email: 'demo@careerpilot.ai',
        passwordHash,
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
        role: 'user',
        provider: 'demo',
        headline: 'Senior Full Stack & AI Architect',
        targetRole: 'Lead AI Engineer'
      });
      console.log('🌱 Seeded Demo User: demo@careerpilot.ai');
    }

    // Seed Initial Career Items if empty
    const itemCounts = await CareerItem.countDocuments();
    if (itemCounts === 0 && demoUser) {
      const sampleItems = [
        {
          userId: demoUser._id,
          title: 'Senior AI Systems Architect',
          category: 'Job Listing',
          companyOrProvider: 'DeepMind Systems Inc.',
          location: 'San Francisco, CA (Hybrid)',
          type: 'Full-time',
          salaryOrCost: '$190,000 - $240,000 / yr',
          experienceLevel: 'Senior',
          description: 'Design and deploy multi-agent LLM orchestrations, rag pipelines, and high-throughput vector search infrastructures for enterprise AI solutions.',
          requirements: ['5+ yrs Python & TypeScript', 'Production experience with LangChain / LlamaIndex / Agentic frameworks', 'Deep understanding of PyTorch or ONNX', 'Distributed systems design'],
          skillsRequired: ['TypeScript', 'Python', 'Agentic AI', 'Vector DBs', 'Next.js'],
          applicationUrl: 'https://careers.deepmind.com',
          status: 'active'
        },
        {
          userId: demoUser._id,
          title: 'Production Agentic AI Specialization',
          category: 'Learning Resource',
          companyOrProvider: 'AI Academy Online',
          location: 'Online Self-Paced',
          type: 'Course',
          salaryOrCost: '$499 / Lifetime',
          experienceLevel: 'Mid-Level',
          description: 'Master autonomous multi-agent tool execution, planning loops, structured outputs, memory graph stores, and evaluation benchmarks.',
          requirements: ['Basic TypeScript or Python knowledge', 'Understanding of REST APIs and JSON'],
          skillsRequired: ['Agentic AI', 'Multi-Agent Frameworks', 'Prompt Engineering', 'TypeScript'],
          applicationUrl: 'https://aiacademy.com/courses/agentic-ai',
          status: 'active'
        },
        {
          userId: demoUser._id,
          title: 'Full Stack Next.js 15 & AI Engineering Roadmap',
          category: 'Skill Pathway',
          companyOrProvider: 'CareerPilot AI Labs',
          location: 'Remote',
          type: 'Certification',
          salaryOrCost: 'Free / Included',
          experienceLevel: 'Mid-Level',
          description: 'Guided end-to-end curriculum bridging traditional Full Stack Web Development (App Router, Server Actions) with cutting edge LLM agents.',
          requirements: ['HTML/CSS/JS fundamentals', 'React basics'],
          skillsRequired: ['Next.js 15', 'React 19', 'Express.js', 'MongoDB', 'TypeScript'],
          applicationUrl: 'https://careerpilot.ai/pathways/nextjs-ai',
          status: 'active'
        },
        {
          userId: demoUser._id,
          title: '1-on-1 AI Technical Leadership Mentorship',
          category: 'Mentorship',
          companyOrProvider: 'TechLead Mentors Network',
          location: 'Remote (Global)',
          type: 'Contract',
          salaryOrCost: '$150 / session',
          experienceLevel: 'Executive',
          description: 'Direct bi-weekly coaching with Principal Engineers & VPs of AI Engineering to help you transition into Staff/Principal roles.',
          requirements: ['Active Software Development role', 'Goal to advance into Tech Lead or Engineering Manager position'],
          skillsRequired: ['Leadership', 'System Design', 'Career Strategy', 'Negotiation'],
          applicationUrl: 'https://techleadmentors.org',
          status: 'active'
        }
      ];

      await CareerItem.insertMany(sampleItems);
      console.log('🌱 Seeded 4 Sample Career Items for Demo User.');
    }
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    // If DB fails to connect, log error and allow in-memory fallback execution in demo mode
  }
};
