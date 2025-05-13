import { 
  users, type User, type InsertUser, 
  translationRequests, type TranslationRequest, type InsertTranslationRequest 
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getAllTranslationRequests(): Promise<TranslationRequest[]>;
  getTranslationRequest(id: number): Promise<TranslationRequest | undefined>;
  createTranslationRequest(request: InsertTranslationRequest): Promise<TranslationRequest>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private translationRequests: Map<number, TranslationRequest>;
  private userCurrentId: number;
  private translationRequestCurrentId: number;

  constructor() {
    this.users = new Map();
    this.translationRequests = new Map();
    this.userCurrentId = 1;
    this.translationRequestCurrentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllTranslationRequests(): Promise<TranslationRequest[]> {
    return Array.from(this.translationRequests.values());
  }

  async getTranslationRequest(id: number): Promise<TranslationRequest | undefined> {
    return this.translationRequests.get(id);
  }

  async createTranslationRequest(insertTranslationRequest: InsertTranslationRequest): Promise<TranslationRequest> {
    const id = this.translationRequestCurrentId++;
    const translationRequest: TranslationRequest = { 
      ...insertTranslationRequest, 
      id, 
      status: "pending" 
    };
    this.translationRequests.set(id, translationRequest);
    return translationRequest;
  }
}

export const storage = new MemStorage();
