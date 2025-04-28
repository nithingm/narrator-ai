import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isError?: boolean;
  deceptionScore?: number;  // NEW
  modelUsed?: string;       // NEW
}

export interface IConversation extends Document {
  userId: string;
  characterId: string;
  messages: IMessage[];
}

const MessageSchema: Schema = new Schema({
  role: { type: String, required: true, enum: ['user', 'assistant'] },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  isError: { type: Boolean, default: false },
  deceptionScore: { type: Number },
  modelUsed: { type: String },
});

const ConversationSchema: Schema = new Schema({
  userId: { type: String, required: true },
  characterId: { type: String, required: true },
  messages: [MessageSchema],
});

export default mongoose.model<IConversation>('Conversation', ConversationSchema);