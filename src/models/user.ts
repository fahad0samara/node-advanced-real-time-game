import mongoose, { Document, Schema } from 'mongoose';

export interface User extends Document {
  email: string;
  name: string;
  provider: string;
  providerId: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<User>(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    provider: { type: String, required: true },
    providerId: { type: String, required: true }
  },
  { timestamps: true }
);

export const UserModel = mongoose.model<User>('User', userSchema);