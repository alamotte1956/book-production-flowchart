import { eq, desc, sql, and, gte } from "drizzle-orm";
import { getDb } from "./db";
import {
  affiliates, InsertAffiliate, Affiliate,
  affiliateClicks, InsertAffiliateClick,
  affiliateConversions, InsertAffiliateConversion, AffiliateConversion,
  affiliatePayouts, InsertAffiliatePayout,
} from "../drizzle/schema";

export async function createAffiliate(data: Omit<InsertAffiliate, "id" | "createdAt" | "updatedAt">): Promise<Affiliate> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [affiliate] = await db.insert(affiliates).values(data).returning();
  return affiliate;
}

export async function getAffiliateByCode(code: string): Promise<Affiliate | null> {
  const db = await getDb();
  if (!db) return null;
  const [aff] = await db.select().from(affiliates).where(eq(affiliates.affiliateCode, code));
  return aff ?? null;
}

export async function getAffiliateByEmail(email: string): Promise<Affiliate | null> {
  const db = await getDb();
  if (!db) return null;
  const [aff] = await db.select().from(affiliates).where(eq(affiliates.email, email));
  return aff ?? null;
}

export async function getAffiliateById(id: number): Promise<Affiliate | null> {
  const db = await getDb();
  if (!db) return null;
  const [aff] = await db.select().from(affiliates).where(eq(affiliates.id, id));
  return aff ?? null;
}

export async function getAffiliateByUserId(userId: number): Promise<Affiliate | null> {
  const db = await getDb();
  if (!db) return null;
  const [aff] = await db.select().from(affiliates).where(eq(affiliates.userId, userId));
  return aff ?? null;
}

export async function recordClick(data: Omit<InsertAffiliateClick, "id" | "createdAt">) {
  const db = await getDb();
  if (!db) return;
  await db.insert(affiliateClicks).values(data);
  await db.update(affiliates).set({
    totalClicks: sql`${affiliates.totalClicks} + 1`,
    updatedAt: new Date(),
  }).where(eq(affiliates.id, data.affiliateId));
}

export async function getClicksByAffiliate(affiliateId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(affiliateClicks)
    .where(eq(affiliateClicks.affiliateId, affiliateId))
    .orderBy(desc(affiliateClicks.createdAt))
    .limit(limit);
}

export async function createConversion(data: Omit<InsertAffiliateConversion, "id" | "createdAt">) {
  const db = await getDb();
  if (!db) return null;

  if (data.stripeSessionId) {
    const [existing] = await db.select({ id: affiliateConversions.id })
      .from(affiliateConversions)
      .where(eq(affiliateConversions.stripeSessionId, data.stripeSessionId));
    if (existing) return null;
  }

  const [conv] = await db.insert(affiliateConversions).values(data).returning();

  await db.update(affiliates).set({
    totalConversions: sql`${affiliates.totalConversions} + 1`,
    totalEarnings: sql`${affiliates.totalEarnings} + ${data.commissionAmount}`,
    pendingEarnings: sql`${affiliates.pendingEarnings} + ${data.commissionAmount}`,
    updatedAt: new Date(),
  }).where(eq(affiliates.id, data.affiliateId));

  return conv;
}

export async function getConversionsByAffiliate(affiliateId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(affiliateConversions)
    .where(eq(affiliateConversions.affiliateId, affiliateId))
    .orderBy(desc(affiliateConversions.createdAt))
    .limit(limit);
}

export async function createPayout(data: Omit<InsertAffiliatePayout, "id" | "createdAt">) {
  const db = await getDb();
  if (!db) return null;
  const [payout] = await db.insert(affiliatePayouts).values(data).returning();
  return payout;
}

export async function getPayoutsByAffiliate(affiliateId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(affiliatePayouts)
    .where(eq(affiliatePayouts.affiliateId, affiliateId))
    .orderBy(desc(affiliatePayouts.createdAt));
}

export async function getAllAffiliates() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(affiliates).orderBy(desc(affiliates.createdAt));
}

export async function markPayoutCompleted(affiliateId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const aff = await getAffiliateById(affiliateId);
  if (!aff) throw new Error("Affiliate not found");
  if (!aff.paypalEmail) throw new Error("Affiliate has no PayPal email");

  const pendingConvs = await db.select()
    .from(affiliateConversions)
    .where(and(
      eq(affiliateConversions.affiliateId, affiliateId),
      sql`${affiliateConversions.status} IN ('pending', 'approved')`
    ));

  if (pendingConvs.length === 0) throw new Error("No pending conversions to pay");

  const totalAmount = pendingConvs.reduce((sum, c) => sum + parseFloat(c.commissionAmount), 0);
  if (totalAmount < 50) throw new Error(`Payout amount $${totalAmount.toFixed(2)} is below $50 minimum threshold`);

  const convIds = pendingConvs.map(c => c.id);
  const amountStr = totalAmount.toFixed(2);

  const [payout] = await db.insert(affiliatePayouts).values({
    affiliateId,
    amount: amountStr,
    paypalEmail: aff.paypalEmail,
    conversionIds: convIds,
    status: "completed",
    processedAt: new Date(),
  }).returning();

  await db.update(affiliates).set({
    pendingEarnings: sql`GREATEST(${affiliates.pendingEarnings}::numeric - ${amountStr}::numeric, 0)`,
    updatedAt: new Date(),
  }).where(eq(affiliates.id, affiliateId));

  for (const cid of convIds) {
    await db.update(affiliateConversions).set({
      status: "paid",
      paidAt: new Date(),
    }).where(eq(affiliateConversions.id, cid));
  }

  return payout;
}

export async function getAffiliateStats(affiliateId: number) {
  const db = await getDb();
  if (!db) return null;
  const aff = await getAffiliateById(affiliateId);
  if (!aff) return null;

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentClicks = await db.select({ count: sql<number>`count(*)` })
    .from(affiliateClicks)
    .where(and(eq(affiliateClicks.affiliateId, affiliateId), gte(affiliateClicks.createdAt, thirtyDaysAgo)));

  const recentConversions = await db.select({ count: sql<number>`count(*)`, total: sql<string>`COALESCE(sum(${affiliateConversions.commissionAmount}), '0.00')` })
    .from(affiliateConversions)
    .where(and(eq(affiliateConversions.affiliateId, affiliateId), gte(affiliateConversions.createdAt, thirtyDaysAgo)));

  return {
    affiliate: aff,
    last30Days: {
      clicks: Number(recentClicks[0]?.count ?? 0),
      conversions: Number(recentConversions[0]?.count ?? 0),
      earnings: recentConversions[0]?.total ?? "0.00",
    },
  };
}

export async function getDailyEarnings(affiliateId: number, days = 30) {
  const db = await getDb();
  if (!db) return [];
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const results = await db.execute(sql`
    SELECT DATE("createdAt") as date, COALESCE(SUM("commissionAmount"), 0) as earnings, COUNT(*) as conversions
    FROM affiliate_conversions
    WHERE "affiliateId" = ${affiliateId} AND "createdAt" >= ${startDate}
    GROUP BY DATE("createdAt")
    ORDER BY date ASC
  `);
  return results.rows;
}
