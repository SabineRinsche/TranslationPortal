import { 
  accounts, type Account, type InsertAccount,
  users, type User, type InsertUser, 
  teams, type Team, type InsertTeam,
  translationRequests, type TranslationRequest, type InsertTranslationRequest,
  projectUpdates, type ProjectUpdate, type InsertProjectUpdate,
  creditTransactions, type CreditTransaction, type InsertCreditTransaction
} from "@shared/schema";
import { db } from "./db";
import { eq, and, inArray } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // Account operations
  getAccount(id: number): Promise<Account | undefined>;
  createAccount(account: InsertAccount): Promise<Account>;
  updateAccountCredits(id: number, credits: number): Promise<Account>;
  updateAccountSubscription(id: number, plan: string, status: string, renewal?: Date): Promise<Account>;
  
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUsersByAccountId(accountId: number): Promise<User[]>;
  getUsersByTeamId(teamId: number): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User>;
  
  // Team operations
  getTeam(id: number): Promise<Team | undefined>;
  getTeamsByAccountId(accountId: number): Promise<Team[]>;
  createTeam(team: InsertTeam): Promise<Team>;
  updateTeam(id: number, team: Partial<InsertTeam>): Promise<Team>;
  deleteTeam(id: number): Promise<void>;
  
  // Authentication-specific user operations
  getUserByEmailVerificationToken(token: string): Promise<User | undefined>;
  getUserByPasswordResetToken(token: string): Promise<User | undefined>;
  updateUserPassword(id: number, hashedPassword: string): Promise<User>;
  updateUserEmailVerification(id: number, isVerified: boolean): Promise<User>;
  updateUserTwoFactor(id: number, secret: string, enabled: boolean): Promise<User>;
  updateUserLastLogin(id: number): Promise<User>;
  
  // Credit transaction operations
  getCreditTransactions(accountId: number): Promise<CreditTransaction[]>;
  getCreditTransactionsByAccountId(accountId: number): Promise<CreditTransaction[]>;
  createCreditTransaction(transaction: InsertCreditTransaction): Promise<CreditTransaction>;
  addCreditsToAccount(accountId: number, amount: number): Promise<void>;
  
  // Translation request operations
  getAllTranslationRequests(): Promise<TranslationRequest[]>;
  getTranslationRequestsByAccountId(accountId: number): Promise<TranslationRequest[]>;
  getTranslationRequest(id: number): Promise<TranslationRequest | undefined>;
  createTranslationRequest(request: InsertTranslationRequest): Promise<TranslationRequest>;
  updateTranslationRequest(id: number, data: Partial<TranslationRequest>): Promise<TranslationRequest>;
  
  // Project tracking operations
  getProjectUpdates(requestId: number): Promise<ProjectUpdate[]>;
  createProjectUpdate(update: InsertProjectUpdate): Promise<ProjectUpdate>;
}

export class DatabaseStorage implements IStorage {
  // Account operations
  async getAccount(id: number): Promise<Account | undefined> {
    const [account] = await db.select().from(accounts).where(eq(accounts.id, id));
    return account || undefined;
  }

  async createAccount(insertAccount: InsertAccount): Promise<Account> {
    const [account] = await db
      .insert(accounts)
      .values(insertAccount)
      .returning();
    return account;
  }

  async updateAccountCredits(id: number, credits: number): Promise<Account> {
    const [account] = await db
      .update(accounts)
      .set({ credits })
      .where(eq(accounts.id, id))
      .returning();
    return account;
  }

  async updateAccountSubscription(id: number, plan: string, status: string, renewal?: Date): Promise<Account> {
    const [account] = await db
      .update(accounts)
      .set({ 
        subscriptionPlan: plan, 
        subscriptionStatus: status,
        ...(renewal && { subscriptionRenewal: renewal })
      })
      .where(eq(accounts.id, id))
      .returning();
    return account;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUsersByAccountId(accountId: number): Promise<User[]> {
    return await db.select().from(users).where(eq(users.accountId, accountId));
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getUsersByTeamId(teamId: number): Promise<User[]> {
    const userList = await db.select().from(users).where(eq(users.teamId, teamId));
    return userList;
  }

  // Team operations
  async getTeam(id: number): Promise<Team | undefined> {
    const [team] = await db.select().from(teams).where(eq(teams.id, id));
    return team || undefined;
  }

  async getTeamsByAccountId(accountId: number): Promise<Team[]> {
    return await db.select().from(teams).where(eq(teams.accountId, accountId));
  }

  async createTeam(team: InsertTeam): Promise<Team> {
    const [newTeam] = await db
      .insert(teams)
      .values(team)
      .returning();
    return newTeam;
  }

  async updateTeam(id: number, teamData: Partial<InsertTeam>): Promise<Team> {
    const [team] = await db
      .update(teams)
      .set({
        ...teamData,
        updatedAt: new Date()
      })
      .where(eq(teams.id, id))
      .returning();
    return team;
  }

  async deleteTeam(id: number): Promise<void> {
    await db.delete(teams).where(eq(teams.id, id));
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        ...userData,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Authentication-specific user operations
  async getUserByEmailVerificationToken(token: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.emailVerificationToken, token));
    return user || undefined;
  }

  async getUserByPasswordResetToken(token: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.passwordResetToken, token));
    return user || undefined;
  }

  async updateUserPassword(id: number, hashedPassword: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserEmailVerification(id: number, isVerified: boolean): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        isEmailVerified: isVerified,
        emailVerificationToken: null,
        emailVerificationExpires: null,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserTwoFactor(id: number, secret: string, enabled: boolean): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        twoFactorSecret: secret,
        twoFactorEnabled: enabled,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserLastLogin(id: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        lastLogin: new Date(),
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Credit transaction operations
  async getCreditTransactions(accountId: number): Promise<CreditTransaction[]> {
    return this.getCreditTransactionsByAccountId(accountId);
  }

  async getCreditTransactionsByAccountId(accountId: number): Promise<CreditTransaction[]> {
    return await db.select().from(creditTransactions).where(eq(creditTransactions.accountId, accountId));
  }

  async addCreditsToAccount(accountId: number, amount: number): Promise<void> {
    // First get current credits
    const [account] = await db.select({ credits: accounts.credits })
      .from(accounts)
      .where(eq(accounts.id, accountId));
    
    if (account) {
      await db.update(accounts)
        .set({ 
          credits: account.credits + amount,
          updatedAt: new Date() 
        })
        .where(eq(accounts.id, accountId));
    }
  }

  async createCreditTransaction(transaction: InsertCreditTransaction): Promise<CreditTransaction> {
    const [creditTransaction] = await db
      .insert(creditTransactions)
      .values(transaction)
      .returning();
    return creditTransaction;
  }

  // Translation request operations
  async getAllTranslationRequests(): Promise<TranslationRequest[]> {
    return await db.select().from(translationRequests);
  }

  async getTranslationRequestsByAccountId(accountId: number): Promise<TranslationRequest[]> {
    const accountUsers = await this.getUsersByAccountId(accountId);
    const userIds = accountUsers.map(user => user.id);
    
    if (userIds.length === 0) {
      return []; // Return empty array if no users found
    }
    
    return await db
      .select()
      .from(translationRequests)
      .where(
        userIds.length === 1 
          ? eq(translationRequests.userId, userIds[0])
          : inArray(translationRequests.userId, userIds)
      );
  }

  async getTranslationRequest(id: number): Promise<TranslationRequest | undefined> {
    const [request] = await db
      .select()
      .from(translationRequests)
      .where(eq(translationRequests.id, id));
    return request || undefined;
  }

  async createTranslationRequest(insertTranslationRequest: InsertTranslationRequest & { createdAt?: Date }): Promise<TranslationRequest> {
    const { createdAt, ...rest } = insertTranslationRequest;
    
    const [translationRequest] = await db
      .insert(translationRequests)
      .values({
        ...rest,
        status: "pending",
        ...(createdAt && { createdAt })
      })
      .returning();
    return translationRequest;
  }
  
  async updateTranslationRequest(id: number, data: Partial<TranslationRequest>): Promise<TranslationRequest> {
    const [updated] = await db
      .update(translationRequests)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(translationRequests.id, id))
      .returning();
      
    return updated;
  }
  
  async getProjectUpdates(requestId: number): Promise<ProjectUpdate[]> {
    return db
      .select()
      .from(projectUpdates)
      .where(eq(projectUpdates.requestId, requestId))
      .orderBy(projectUpdates.createdAt);
  }
  
  async createProjectUpdate(insertProjectUpdate: InsertProjectUpdate): Promise<ProjectUpdate> {
    const [update] = await db
      .insert(projectUpdates)
      .values(insertProjectUpdate)
      .returning();
      
    // If this is a status change update, also update the request status
    if (insertProjectUpdate.updateType === 'status_change' && insertProjectUpdate.newStatus) {
      await this.updateTranslationRequest(
        insertProjectUpdate.requestId,
        { status: insertProjectUpdate.newStatus }
      );
    }
    
    return update;
  }
}

export const storage = new DatabaseStorage();
