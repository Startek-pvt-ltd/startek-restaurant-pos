"use server";

import { revalidatePath } from "next/cache";

import { requireAuth } from "@/lib/auth-utils";
import { closeCashSession, openCashSession } from "../services/cash-session-service";
import type { CashSessionActionResult } from "../types";
import { closeCashSessionSchema, openCashSessionSchema } from "../validations/cash-session-schema";

function failure(error: unknown): CashSessionActionResult {
  const code=error instanceof Error?error.message:"";
  const messages:Record<string,string>={CASH_SESSION_ACCESS_DENIED:"Your active account cannot manage cash sessions.",CASH_SESSION_ALREADY_OPEN:"A cash session is already open.",CASH_SESSION_NOT_OPEN:"This cash session is no longer open.",CASH_SESSION_CLOSE_DENIED:"Cashiers can close only the session they opened.",CASH_SESSION_PASSWORD_INVALID:"The current password is incorrect."};
  if(messages[code])return{success:false,message:messages[code]};
  console.error("Cash session operation failed.",error);
  return{success:false,message:"The cash session could not be updated. Please try again."};
}
function fields(error:{flatten:()=>{fieldErrors:Record<string,string[]>}}):CashSessionActionResult{return{success:false,message:"Correct the highlighted cash session fields.",fieldErrors:error.flatten().fieldErrors};}
function refresh(){revalidatePath("/cash-closing");revalidatePath("/cash-closing/history");revalidatePath("/dashboard");revalidatePath("/pos");}

export async function openCashSessionAction(input:unknown):Promise<CashSessionActionResult>{const session=await requireAuth();const parsed=openCashSessionSchema.safeParse(input);if(!parsed.success)return fields(parsed.error);try{const result=await openCashSession(parsed.data,session.user.id);refresh();return{success:true,message:"Cash register opened successfully.",sessionId:result.id};}catch(error){return failure(error);}}
export async function closeCashSessionAction(input:unknown):Promise<CashSessionActionResult>{const session=await requireAuth();const parsed=closeCashSessionSchema.safeParse(input);if(!parsed.success)return fields(parsed.error);try{const result=await closeCashSession(parsed.data,session.user.id);refresh();return{success:true,message:"Cash session closed and totals locked.",sessionId:result.id};}catch(error){return failure(error);}}
