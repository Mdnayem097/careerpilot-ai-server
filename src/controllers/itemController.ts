import { Request, Response } from 'express';
import CareerItem from '../models/CareerItem';
import { AuthRequest } from '../middleware/auth';

export const getItems = async (req: Request, res: Response) => {
  try {
    const { search, category, type, experienceLevel, page = 1, limit = 9 } = req.query;

    const query: any = { status: 'active' };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { companyOrProvider: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { skillsRequired: { $elemMatch: { $regex: search, $options: 'i' } } }
      ];
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (type && type !== 'All') {
      query.type = type;
    }

    if (experienceLevel && experienceLevel !== 'All') {
      query.experienceLevel = experienceLevel;
    }

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 9;
    const skip = (pageNum - 1) * limitNum;

    const totalItems = await CareerItem.countDocuments(query);
    const items = await CareerItem.find(query)
      .populate('userId', 'name email avatarUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    return res.json({
      items,
      pagination: {
        totalItems,
        currentPage: pageNum,
        totalPages: Math.ceil(totalItems / limitNum),
        limit: limitNum
      }
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching career items', error: error.message });
  }
};

export const getItemById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const item = await CareerItem.findById(id).populate('userId', 'name email avatarUrl headline');

    if (!item) {
      return res.status(404).json({ message: 'Career item not found' });
    }

    return res.json({ item });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching career item', error: error.message });
  }
};

export const createItem = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const {
      title,
      category,
      companyOrProvider,
      location,
      type,
      salaryOrCost,
      experienceLevel,
      description,
      requirements,
      skillsRequired,
      applicationUrl
    } = req.body;

    if (!title || !companyOrProvider || !description || !salaryOrCost) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newItem = await CareerItem.create({
      userId: req.user.userId,
      title,
      category: category || 'Job Listing',
      companyOrProvider,
      location: location || 'Remote',
      type: type || 'Full-time',
      salaryOrCost,
      experienceLevel: experienceLevel || 'Senior',
      description,
      requirements: Array.isArray(requirements) ? requirements : (requirements ? requirements.split('\n').filter(Boolean) : []),
      skillsRequired: Array.isArray(skillsRequired) ? skillsRequired : (skillsRequired ? skillsRequired.split(',').map((s: string) => s.trim()) : []),
      applicationUrl: applicationUrl || '#',
      status: 'active'
    });

    return res.status(201).json({ message: 'Career item created successfully', item: newItem });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error creating career item', error: error.message });
  }
};

export const updateItem = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id } = req.params;
    const item = await CareerItem.findById(id);

    if (!item) {
      return res.status(404).json({ message: 'Career item not found' });
    }

    if (item.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: You do not own this item' });
    }

    const updatedItem = await CareerItem.findByIdAndUpdate(id, { $set: req.body }, { new: true });

    return res.json({ message: 'Item updated successfully', item: updatedItem });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error updating career item', error: error.message });
  }
};

export const deleteItem = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id } = req.params;
    const item = await CareerItem.findById(id);

    if (!item) {
      return res.status(404).json({ message: 'Career item not found' });
    }

    if (item.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: You do not own this item' });
    }

    await CareerItem.findByIdAndDelete(id);

    return res.json({ message: 'Career item deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error deleting career item', error: error.message });
  }
};

export const getUserItems = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const items = await CareerItem.find({ userId: req.user.userId }).sort({ createdAt: -1 });

    return res.json({ items });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching user career items', error: error.message });
  }
};
