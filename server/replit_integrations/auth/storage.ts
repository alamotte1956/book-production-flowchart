import { users, type User, type InsertUser } from "../../../drizzle/schema";
import { getDb } from "../../db";
import { eq } from "drizzle-orm";

export interface IAuthStorage {
  getUser(openId: string): Promise<User | undefined>;
  upsertUser(userData: { openId: string; name?: string | null; email?: string | null }): Promise<User>;
}

class AuthStorage implements IAuthStorage {
  async getUser(openId: string): Promise<User | undefined> {
    const db = await getDb();
    if (!db) return undefined;
    const [user] = await db.select().from(users).where(eq(users.openId, openId));
    return user;
  }

  async upsertUser(userData: { openId: string; name?: string | null; email?: string | null }): Promise<User> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const [user] = await db
      .insert(users)
      .values({
        openId: userData.openId,
        name: userData.name ?? null,
        email: userData.email ?? null,
        lastSignedIn: new Date(),
      })
      .onConflictDoUpdate({
        target: users.openId,
        set: {
          name: userData.name ?? null,
          email: userData.email ?? null,
          lastSignedIn: new Date(),
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }
}

export const authStorage = new AuthStorage();
