import mongoose, { Schema, Document } from 'mongoose';

export interface ICharacter extends Document {
  id: string;
  name: string;
  title: string;
  description: string;
  imageUrl: string;
  backgroundColor: string;
  hoverBackground: string;
  shadowColor: string;
  textColor: string;
  accent: string;
  book: string;
  author: string;
  year: number;
  defaultModel: string;
  systemPrompt: string;
}

const CharacterSchema: Schema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String },
  backgroundColor: { type: String },
  hoverBackground: { type: String },
  shadowColor: { type: String },
  textColor: { type: String },
  accent: { type: String },
  book: { type: String },
  author: { type: String },
  year: { type: Number },
  defaultModel: { type: String },
  systemPrompt: { type: String },
});

export default mongoose.model<ICharacter>('Character', CharacterSchema);
