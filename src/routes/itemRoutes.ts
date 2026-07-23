import { Router } from 'express';
import {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  getUserItems
} from '../controllers/itemController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.get('/', getItems);
router.get('/my-items', authenticateJWT, getUserItems);
router.get('/:id', getItemById);
router.post('/', authenticateJWT, createItem);
router.put('/:id', authenticateJWT, updateItem);
router.delete('/:id', authenticateJWT, deleteItem);

export default router;
