import express, { Request, Response } from 'express';
import Character from '../models/Character';

const router = express.Router();

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const character = await Character.findOne({ id: req.params.id });
    if (!character) {
      // Call res.status(...).json(...) but do NOT return that object
      res.status(404).json({ message: 'Character not found' });
      return; // Exit the function so we don’t continue
    }
    // If found, respond
    res.json(character);
  } catch (error) {
    console.error(`Error fetching character ${req.params.id}:`, error);
    res.status(500).json({ message: 'Failed to fetch character' });
  }
});

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const characters = await Character.find({});
    res.json(characters);
  } catch (error) {
    console.error('Error fetching characters:', error);
    res.status(500).json({ message: 'Failed to fetch characters' });
  }
});

export default router;
