console.log("✅ characters.js is being loaded!");

const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

// Get all characters
router.get('/', async (req, res) => {
  console.log("🛠️ API Route `/api/characters` hit! Fetching character files...");
  try {
    const charactersDir = path.join(__dirname, '../../data/characters');
    const files = await fs.readdir(charactersDir);
    
    console.log("📂Character files found:", files);

    const characters = await Promise.all(
      files
        .filter(file => file.endsWith('.json'))
        .map(async (file) => {
          const filePath = path.join(charactersDir, file);
          console.log("Reading file:", filePath);
          const content = await fs.readFile(filePath, 'utf8');
          return JSON.parse(content);
        })
    );
    console.log("Final characters sent to frontend:", characters);
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

// 🚀 TEST ROUTE 1: Create a New Character JSON File
router.post('/test-write', async (req, res) => {
  try {
      const testCharacterPath = path.join(__dirname, '../../data/characters/test_character.json');
      const testData = {
          id: "test",
          name: "Test Character",
          description: "This is a test character.",
          book: "Test Book",
          author: "Test Author"
      };
      await fs.writeFile(testCharacterPath, JSON.stringify(testData, null, 2));
      res.json({ message: "✅ Successfully created test_character.json" });
  } catch (error) {
      console.error('❌ Error writing file:', error);
      res.status(500).json({ message: "Failed to write file", error });
  }
});

// 🚀 TEST ROUTE 2: Modify an Existing JSON File
router.put('/test-modify', async (req, res) => {
  try {
      const testFilePath = path.join(__dirname, '../../data/characters/test_character.json');
      const newData = {
          modified: true,
          note: "This file has been modified by the backend."
      };

      const existingData = await fs.readFile(testFilePath, 'utf8');
      const parsedData = JSON.parse(existingData);
      const updatedData = { ...parsedData, ...newData };

      await fs.writeFile(testFilePath, JSON.stringify(updatedData, null, 2));
      res.json({ message: "✅ Successfully modified test_character.json" });
  } catch (error) {
      console.error('❌ Error modifying file:', error);
      res.status(500).json({ message: "Failed to modify file", error });
  }
});

// 🚀 TEST ROUTE 3: Delete a Character JSON File
router.delete('/test-delete', async (req, res) => {
  try {
      const testFilePath = path.join(__dirname, '../../data/characters/test_character.json');
      await fs.unlink(testFilePath);
      res.json({ message: "✅ Successfully deleted test_character.json" });
  } catch (error) {
      console.error('❌ Error deleting file:', error);
      res.status(500).json({ message: "Failed to delete file", error });
  }
});

// 🛠 EXPORT ROUTER
module.exports = router;
