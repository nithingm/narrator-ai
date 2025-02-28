const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

// Get all characters
router.get('/', async (req, res) => {
  try {
    const charactersDir = path.join(__dirname, '../../data/characters');
    const files = await fs.readdir(charactersDir);
    
    const characters = await Promise.all(
      files
        .filter(file => file.endsWith('.json'))
        .map(async (file) => {
          const content = await fs.readFile(path.join(charactersDir, file), 'utf8');
          return JSON.parse(content);
        })
    );
    
    res.json(characters);
  } catch (error) {
    console.error('Error fetching characters:', error);
    res.status(500).json({ message: 'Failed to fetch characters' });
  }
});

// Get character by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const characterPath = path.join(__dirname, `../../data/characters/${id}.json`);
    
    const characterData = await fs.readFile(characterPath, 'utf8');
    const character = JSON.parse(characterData);
    
    res.json(character);
  } catch (error) {
    console.error(`Error fetching character ${req.params.id}:`, error);
    res.status(404).json({ message: 'Character not found' });
  }
});

module.exports = router;