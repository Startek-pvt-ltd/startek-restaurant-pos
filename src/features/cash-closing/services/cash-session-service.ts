import "server-only";

import bcrypt from "bcryptjs";

import { Prisma, type UserRole } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

import { CASH_SESSION_MANAGEMENT_ROLES, CASH_SESSION_ROLES, type CashDifferenceStatus, type CashSessionFilters, type CashSessionSummary } from "../types";
import type { CloseCashSessionInput, OpenCashSessionInput } from "../validations/cash-session-schema";

type Database = Prisma.TransactionClient | typeof prisma;

function allowed(role: UserRole) { return CASH_SESSION_ROLES.includes(role); }
function manager(role: UserRole) { return CASH_SESSION_MANAGEMENT_ROLES.includes(role); }
function differenceStatus(value: Prisma.Decimal | null): CashDifferenceStatus | null { if (value === null) return null; if (value.isZero()) return "EXACT"; return value.isPositive() ? "OVER" : "SHORT"; }
function dateWhere(dateFrom?: string, dateTo?: string) { return { ...(dateFrom ? { gte: new Date(`${dateFrom}T00:00:00.000+05:30`) } : {}), ...(dateTo ? { lt: new Date(new Date(`${dateTo}T00:00:00.000+05:30`).getTime() + 86_400_000) } : {}) }; }

async function activeActor(db: Database, userId: string, withPassword = false) {
  const user = await db.user.findUnique({ where: { id: userId }, select: { role: true, status: true, ...(withPassword ? { password: true } : {}) } });
  if (!user || user.status !== "ACTIVE" || !allowed(user.role)) throw new Error("CASH_SESSION_ACCESS_DENIED");
  return user;
}

async function calculateTotals(db: Database, openedAt: Date, endedAt = new Date()) {
  const range = { gte: openedAt, lte: endedAt };
  const [payments, totalExpenses, cashExpenses] = await Promise.all([
    db.payment.groupBy({ by: ["paymentMethod"], where: { paymentStatus: "PAID", paymentMethod: { in: ["CASH", "CARD", "QR"] }, order: { status: "COMPLETED", createdAt: range } }, _sum: { amount: true } }),
    db.expense.aggregate({ where: { createdAt: range }, _sum: { amount: true } }),
    db.expense.aggregate({ where: { createdAt: range, paymentMethod: "CASH" }, _sum: { amount: true } }),
  ]);
  const amount = (method: "CASH" | "CARD" | "QR") => payments.find((payment) => payment.paymentMethod === method)?._sum.amount ?? new Prisma.Decimal(0);
  const cashSales = amount("CASH"); const cardSales = amount("CARD"); const qrSales = amount("QR");
  return { cashSales, cardSales, qrSales, totalSales: cashSales.plus(cardSales).plus(qrSales), totalExpenses: totalExpenses._sum.amount ?? new Prisma.Decimal(0), cashExpenses: cashExpenses._sum.amount ?? new Prisma.Decimal(0) };
}

function serialize(session: { id:string; status:"OPEN"|"CLOSED"; openedById:string; openingCash:Prisma.Decimal; openingNote:string|null; openedAt:Date; closedAt:Date|null; expectedCash:Prisma.Decimal; actualCash:Prisma.Decimal|null; cashDifference:Prisma.Decimal|null; cashSales:Prisma.Decimal; cardSales:Prisma.Decimal; qrSales:Prisma.Decimal; totalSales:Prisma.Decimal; cashExpenses:Prisma.Decimal; totalExpenses:Prisma.Decimal; notes:string|null; openedBy:{fullName:string}; closedBy:{fullName:string}|null }, live?: Awaited<ReturnType<typeof calculateTotals>>): CashSessionSummary {
  const totals = live ?? session;
  const expected = live ? session.openingCash.plus(live.cashSales).minus(live.cashExpenses) : session.expectedCash;
  return { id:session.id,status:session.status,openedById:session.openedById,openedBy:session.openedBy.fullName,closedBy:session.closedBy?.fullName??null,openingCash:session.openingCash.toFixed(2),openingNote:session.openingNote,openedAt:session.openedAt.toISOString(),closedAt:session.closedAt?.toISOString()??null,cashSales:totals.cashSales.toFixed(2),cardSales:totals.cardSales.toFixed(2),qrSales:totals.qrSales.toFixed(2),totalSales:totals.totalSales.toFixed(2),cashExpenses:totals.cashExpenses.toFixed(2),totalExpenses:totals.totalExpenses.toFixed(2),expectedCash:expected.toFixed(2),actualCash:session.actualCash?.toFixed(2)??null,cashDifference:session.cashDifference?.toFixed(2)??null,differenceStatus:differenceStatus(session.cashDifference),notes:session.notes };
}

const sessionSelect = { id:true,status:true,openedById:true,openingCash:true,openingNote:true,openedAt:true,closedAt:true,expectedCash:true,actualCash:true,cashDifference:true,cashSales:true,cardSales:true,qrSales:true,totalSales:true,cashExpenses:true,totalExpenses:true,notes:true,openedBy:{select:{fullName:true}},closedBy:{select:{fullName:true}} } as const;

export async function getActiveCashSession() {
  const session = await prisma.cashSession.findFirst({ where: { status: "OPEN" }, select: sessionSelect, orderBy: { openedAt: "desc" } });
  if (!session) return null;
  return serialize(session, await calculateTotals(prisma, session.openedAt));
}

export async function openCashSession(input: OpenCashSessionInput, userId: string) {
  try {
    return await prisma.$transaction(async (tx) => {
      await activeActor(tx, userId);
      if (await tx.cashSession.count({ where: { status: "OPEN" } })) throw new Error("CASH_SESSION_ALREADY_OPEN");
      const openingCash = new Prisma.Decimal(input.openingCash);
      const session = await tx.cashSession.create({ data: { openedById:userId,openingCash,openingNote:input.openingNote||null,expectedCash:openingCash }, select:{id:true} });
      await tx.activityLog.create({ data:{userId,action:`CASH_SESSION_OPENED | ${session.id} | ${openingCash.toFixed(2)}`} });
      return session;
    }, { isolationLevel: "Serializable" });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && (error.code === "P2002" || error.code === "P2034")) throw new Error("CASH_SESSION_ALREADY_OPEN");
    throw error;
  }
}

export async function closeCashSession(input: CloseCashSessionInput, userId: string) {
  const actor = await activeActor(prisma, userId, true);
  if (!("password" in actor) || !await bcrypt.compare(input.currentPassword, actor.password)) {
    await prisma.activityLog.create({ data:{userId,action:`CASH_SESSION_CLOSE_FAILED | ${input.sessionId} | INCORRECT_PASSWORD`} });
    throw new Error("CASH_SESSION_PASSWORD_INVALID");
  }
  try {
    return await prisma.$transaction(async (tx) => {
      await activeActor(tx, userId);
      const locked = await tx.$queryRaw<Array<{id:string}>>(Prisma.sql`SELECT id FROM "CashSession" WHERE id = ${input.sessionId}::uuid AND status = 'OPEN' FOR UPDATE`);
      if (!locked.length) throw new Error("CASH_SESSION_NOT_OPEN");
      const session = await tx.cashSession.findUnique({ where:{id:input.sessionId}, select:sessionSelect });
      if (!session || session.status !== "OPEN") throw new Error("CASH_SESSION_NOT_OPEN");
      if (!manager(actor.role) && session.openedById !== userId) throw new Error("CASH_SESSION_CLOSE_DENIED");
      const closedAt = new Date();
      const totals = await calculateTotals(tx, session.openedAt, closedAt);
      const expectedCash = session.openingCash.plus(totals.cashSales).minus(totals.cashExpenses);
      const actualCash = new Prisma.Decimal(input.actualCash);
      const cashDifference = actualCash.minus(expectedCash);
      const updated = await tx.cashSession.update({ where:{id:session.id}, data:{status:"CLOSED",closedById:userId,closedAt,expectedCash,actualCash,cashDifference,cashSales:totals.cashSales,cardSales:totals.cardSales,qrSales:totals.qrSales,totalSales:totals.totalSales,cashExpenses:totals.cashExpenses,totalExpenses:totals.totalExpenses,notes:input.notes||null}, select:{id:true} });
      await tx.activityLog.create({ data:{userId,action:`CASH_SESSION_CLOSED | ${session.id} | ${cashDifference.toFixed(2)}`} });
      return updated;
    }, { isolationLevel:"Serializable", timeout:15_000 });
  } catch (error) {
    const code = error instanceof Error ? error.message : "DATABASE_FAILURE";
    const reason = code.startsWith("CASH_SESSION_") ? code : "DATABASE_FAILURE";
    await prisma.activityLog.create({ data:{userId,action:`CASH_SESSION_CLOSE_FAILED | ${input.sessionId} | ${reason}`} }).catch(()=>undefined);
    throw error;
  }
}

export async function getCashSession(id: string) {
  const session = await prisma.cashSession.findUnique({ where:{id}, select:sessionSelect });
  if (!session) return null;
  return serialize(session, session.status === "OPEN" ? await calculateTotals(prisma, session.openedAt) : undefined);
}

export async function getCashSessionHistory(filters: CashSessionFilters) {
  const and: Prisma.CashSessionWhereInput[] = [];
  if (filters.query) and.push({ OR:[{openedBy:{fullName:{contains:filters.query,mode:"insensitive"}}},{closedBy:{is:{fullName:{contains:filters.query,mode:"insensitive"}}}}] });
  if (filters.staffId) and.push({ OR:[{openedById:filters.staffId},{closedById:filters.staffId}] });
  const where: Prisma.CashSessionWhereInput = { AND: and, ...(filters.dateFrom||filters.dateTo ? {openedAt:dateWhere(filters.dateFrom,filters.dateTo)} : {}), ...(filters.difference === "EXACT" ? {cashDifference:0} : filters.difference === "OVER" ? {cashDifference:{gt:0}} : filters.difference === "SHORT" ? {cashDifference:{lt:0}} : {}) };
  const total = await prisma.cashSession.count({where}); const totalPages=Math.max(1,Math.ceil(total/filters.pageSize)); const page=Math.min(filters.page,totalPages);
  const rows=await prisma.cashSession.findMany({where,select:sessionSelect,orderBy:{openedAt:"desc"},skip:(page-1)*filters.pageSize,take:filters.pageSize});
  return {sessions:rows.map((row)=>serialize(row)),total,totalPages,page};
}

export async function getCashSessionStaff() { return prisma.user.findMany({where:{role:{in:[...CASH_SESSION_ROLES]}},select:{id:true,fullName:true},orderBy:{fullName:"asc"}}); }
