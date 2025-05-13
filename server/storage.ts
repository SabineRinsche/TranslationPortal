import { 
  users, type User, type InsertUser, 
  translationRequests, type TranslationRequest, type InsertTranslationRequest 
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getAllTranslationRequests(): Promise<TranslationRequest[]>;
  getTranslationRequest(id: number): Promise<TranslationRequest | undefined>;
  createTranslationRequest(request: InsertTranslationRequest): Promise<TranslationRequest>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getAllTranslationRequests(): Promise<TranslationRequest[]> {
    return await db.select().from(translationRequests);
  }

  async getTranslationRequest(id: number): Promise<TranslationRequest | undefined> {
    const [request] = await db
      .select()
      .from(translationRequests)
      .where(eq(translationRequests.id, id));
    return request || undefined;
  }

  async createTranslationRequest(insertTranslationRequest: InsertTranslationRequest): Promise<TranslationRequest> {
    const [translationRequest] = await db
      .insert(translationRequests)
      .values({
        ...insertTranslationRequest,
        status: "pending"
      })
      .returning();
    return translationRequest;
  }
}

export const storage = new DatabaseStorage();
