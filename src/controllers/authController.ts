import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

const generateToken = (userId: string, email: string, role: string) => {
  const secret = process.env.JWT_SECRET || 'careerpilot_secret_key_agentic_ai_2026_super_secure';
  return jwt.sign({ userId, email, role }, secret, { expiresIn: '7d' });
};

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, headline, targetRole } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      passwordHash,
      provider: 'credentials',
      headline: headline || 'Software Engineer',
      targetRole: targetRole || 'Senior Full Stack Engineer'
    });

    const token = generateToken(newUser._id.toString(), newUser.email, newUser.role);

    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        avatarUrl: newUser.avatarUrl,
        headline: newUser.headline,
        targetRole: newUser.targetRole,
        role: newUser.role,
        provider: newUser.provider
      }
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Server error registering user', error: error.message });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id.toString(), user.email, user.role);

    return res.json({
      message: 'Logged in successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        headline: user.headline,
        targetRole: user.targetRole,
        role: user.role,
        provider: user.provider
      }
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

export const demoLogin = async (req: Request, res: Response) => {
  try {
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
    }

    const token = generateToken(demoUser._id.toString(), demoUser.email, demoUser.role);

    return res.json({
      message: 'Demo login successful',
      token,
      user: {
        id: demoUser._id,
        name: demoUser.name,
        email: demoUser.email,
        avatarUrl: demoUser.avatarUrl,
        headline: demoUser.headline,
        targetRole: demoUser.targetRole,
        role: demoUser.role,
        provider: demoUser.provider
      }
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Server error during demo login', error: error.message });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findById(req.user.userId).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        headline: user.headline,
        targetRole: user.targetRole,
        role: user.role,
        provider: user.provider
      }
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Server error fetching user details', error: error.message });
  }
};
