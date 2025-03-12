import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import Character from '../models/Character';
import Conversation from '../models/Conversation';

dotenv.config({ path: '../../.env', override: true });
console.log('MONGODB_URI:', process.env.MONGODB_URI);
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is not defined');
}

async function migrateCharacters() {
  try {
    const charactersDir = path.join(__dirname, '../../data/characters');
    const files = await fs.readdir(charactersDir);
    for (const file of files) {
      if (file.endsWith('.json')) {
        const content = await fs.readFile(path.join(charactersDir, file), 'utf8');
        const data = JSON.parse(content);
        await Character.updateOne({ id: data.id }, data, { upsert: true });
      }
    }
    console.log('Characters migrated successfully.');
  } catch (error) {
    console.error('Error migrating characters:', error);
  }
}

async function migrateConversations() {
  try {
    const convDir = path.join(__dirname, '../../data/conversations');
    const files = await fs.readdir(convDir);
    for (const file of files) {
      if (file.endsWith('.json')) {
        const content = await fs.readFile(path.join(convDir, file), 'utf8');
        const data = JSON.parse(content);
        await Conversation.updateOne({ userId: data.userId, characterId: data.characterId }, data, { upsert: true });
      }
    }
    console.log('Conversations migrated successfully.');
  } catch (error) {
    console.error('Error migrating conversations:', error);
  }
}

(async function migrate() {
  await mongoose.connect(MONGODB_URI);
  await migrateCharacters();
  await migrateConversations();
  mongoose.disconnect();
})();
