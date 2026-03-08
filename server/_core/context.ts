import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { getUserByOpenId, upsertUser } from "../db";

const GUEST_OPEN_ID = "guest-default-user";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

async function getOrCreateGuestUser(): Promise<User | null> {
  try {
    let guest = await getUserByOpenId(GUEST_OPEN_ID);
    if (!guest) {
      await upsertUser({
        openId: GUEST_OPEN_ID,
        name: "Guest User",
        email: null,
        loginMethod: "guest",
      });
      guest = await getUserByOpenId(GUEST_OPEN_ID);
    }
    return guest ?? null;
  } catch {
    return null;
  }
}

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    const reqUser = (opts.req as any).user;
    if (reqUser?.claims?.sub) {
      const dbUser = await getUserByOpenId(reqUser.claims.sub);
      user = dbUser ?? null;
    }
  } catch (error) {
    user = null;
  }

  if (!user) {
    user = await getOrCreateGuestUser();
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
