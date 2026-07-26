"use server";

import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { hasRole, requireAuth } from "@/lib/auth-utils";
import { OWNER_SETTINGS_ROLES, type ActionResult } from "../types";
import { saveBillingSettings, savePrinterSettings, saveReceiptSettings, saveRestaurantSettings, saveSystemPreferences } from "../services/settings-service";
import { billingSettingsSchema, printerSettingsSchema, receiptSettingsSchema, restaurantSettingsSchema, systemPreferencesSchema } from "../validations/settings";

function finish(message: string): ActionResult { revalidatePath("/settings", "layout"); revalidatePath("/pos"); revalidatePath("/orders"); return { success: true, message }; }
function failed(error: unknown): ActionResult { if (error instanceof Error && error.message === "SETTINGS_ACCESS_DENIED") return { success: false, message: "You do not have permission to change these settings." }; console.error("Settings update failed", error); return { success: false, message: "Settings could not be saved. Please try again." }; }
async function run<T>(input: unknown, schema: { safeParse: (v: unknown) => { success: true; data: T } | { success: false; error: { issues: { message: string }[] } } }, save: (value: T, id: string) => Promise<unknown>, message: string) {
  const session=await requireAuth(); const parsed=schema.safeParse(input); if(!parsed.success) return {success:false,message:parsed.error.issues[0]?.message??"Invalid settings."}; try { await save(parsed.data,session.user.id); return finish(message); } catch(error){ return failed(error); }
}
export async function updateBillingSettingsAction(input: unknown){return run(input,billingSettingsSchema,saveBillingSettings,"Billing settings saved.");}
export async function updateReceiptSettingsAction(input: unknown){return run(input,receiptSettingsSchema,saveReceiptSettings,"Receipt settings saved.");}
export async function updatePrinterSettingsAction(input: unknown){return run(input,printerSettingsSchema,savePrinterSettings,"Printer settings saved.");}
export async function updateSystemSettingsAction(input: unknown){return run(input,systemPreferencesSchema,saveSystemPreferences,"System preferences saved.");}

function logoType(bytes: Uint8Array, mime: string) {
  if(mime==="image/png"&&bytes[0]===0x89&&bytes[1]===0x50&&bytes[2]===0x4e&&bytes[3]===0x47)return "png";
  if(mime==="image/jpeg"&&bytes[0]===0xff&&bytes[1]===0xd8&&bytes[2]===0xff)return "jpg";
  if(mime==="image/webp"&&String.fromCharCode(...bytes.slice(0,4))==="RIFF"&&String.fromCharCode(...bytes.slice(8,12))==="WEBP")return "webp";
  return null;
}
export async function updateRestaurantSettingsAction(input: unknown, logo: File | null): Promise<ActionResult> {
  const session=await requireAuth(); if(!hasRole(session.user.role,OWNER_SETTINGS_ROLES))return {success:false,message:"You do not have permission to change restaurant settings."}; const parsed=restaurantSettingsSchema.safeParse(input); if(!parsed.success)return {success:false,message:parsed.error.issues[0]?.message??"Invalid restaurant settings."};
  try {
    let logoPath: string|undefined;
    if(logo&&logo.size>0){if(logo.size>2*1024*1024)return {success:false,message:"Logo must be 2 MB or smaller."}; const bytes=new Uint8Array(await logo.arrayBuffer()); const ext=logoType(bytes,logo.type); if(!ext)return {success:false,message:"Use a valid PNG, JPEG, or WebP image."}; const directory=path.resolve(process.cwd(),"public","uploads","restaurant"); await mkdir(directory,{recursive:true}); const name=`${randomUUID()}.${ext}`; await writeFile(path.join(directory,name),bytes,{flag:"wx"}); logoPath=`/uploads/restaurant/${name}`;}
    await saveRestaurantSettings(parsed.data,session.user.id,logoPath); return finish("Restaurant settings saved.");
  } catch(error){return failed(error);}
}
