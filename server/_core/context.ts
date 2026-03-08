import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { getUserByOpenId } from "../db";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

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

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
