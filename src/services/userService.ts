import { UserModel, User } from '../models/user';

interface CreateUserData {
  email: string;
  name: string;
  provider: string;
  providerId: string;
}

export async function findOrCreateUser(userData: CreateUserData): Promise<User> {
  const existingUser = await UserModel.findOne({
    email: userData.email,
    provider: userData.provider
  });

  if (existingUser) {
    return existingUser;
  }

  const newUser = new UserModel(userData);
  return newUser.save();
}

export async function findUserById(id: string): Promise<User | null> {
  return UserModel.findById(id);
}

export async function findUserByEmail(email: string): Promise<User | null> {
  return UserModel.findOne({ email });
}