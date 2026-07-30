import { createHash, timingSafeEqual } from "node:crypto";
import { appendFile, mkdir, readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { connect } from "node:net";
import path from "node:path";

const listenHost = "127.0.0.1";
const listenPort = Number(process.env.PRINTER_BRIDGE_PORT || 4318);
const printerHost = process.env.ESC_POS_PRINTER_HOST?.trim();
const printerPort = Number(process.env.ESC_POS_PRINTER_PORT || 9100);
const token = process.env.PRINTER_BRIDGE_TOKEN?.trim();
const stateFile = path.resolve(process.env.PRINTER_BRIDGE_STATE_FILE || ".pos-runtime/printer-jobs.jsonl");
if (!printerHost || !token || token.length < 32) throw new Error("Set ESC_POS_PRINTER_HOST and a PRINTER_BRIDGE_TOKEN of at least 32 characters.");

const jobs = new Map();
const runningJobs = new Map();
try { for (const line of (await readFile(stateFile, "utf8")).split("\n").filter(Boolean)) { const entry = JSON.parse(line); jobs.set(entry.jobId, entry); } } catch (error) { if (error?.code !== "ENOENT") throw error; }
await mkdir(path.dirname(stateFile), { recursive: true });
const record = async (entry) => { jobs.set(entry.jobId, entry); await appendFile(stateFile, `${JSON.stringify(entry)}\n`, { mode: 0o600 }); };
const authorized = (header = "") => { const supplied = header.startsWith("Bearer ") ? header.slice(7) : ""; if (!supplied) return false; const a=createHash("sha256").update(supplied).digest(),b=createHash("sha256").update(token).digest(); return timingSafeEqual(a,b); };
const write = (socket, bytes) => new Promise((resolve, reject) => socket.write(bytes, (error) => error ? reject(error) : resolve()));
const openPrinter = () => new Promise((resolve, reject) => { const socket=connect({host:printerHost,port:printerPort}); socket.setTimeout(8_000); socket.once("connect",()=>resolve(socket)); socket.once("error",reject); socket.once("timeout",()=>socket.destroy(new Error("Printer connection timed out."))); });

async function runJob(job) {
  const previous = jobs.get(job.jobId);
  if (previous?.status === "COMPLETED" || previous?.status === "FAILED") return previous;
  const state = { jobId: job.jobId, status: "PROCESSING", receiptSent: false, drawerOpened: false, cut: false, updatedAt: new Date().toISOString() };
  await record(state);
  let socket;
  try {
    socket = await openPrinter();
    if (job.receiptText) { await record({ ...state, receiptAttempted: true }); await write(socket, Buffer.concat([Buffer.from([0x1b,0x40]),Buffer.from(job.receiptText,"utf8"),Buffer.from("\n\n")])); state.receiptSent=true; await record({ ...state }); }
    if (job.openDrawer) { await record({ ...state, drawerAttempted: true }); const on=Math.min(255,Math.round(job.drawerPulseOnMs/2)),off=Math.min(255,Math.round(job.drawerPulseOffMs/2)); await write(socket,Buffer.from([0x1b,0x70,job.drawerPin,on,off])); state.drawerOpened=true; await record({ ...state }); }
    if (job.automaticCut) { await record({ ...state, cutAttempted: true }); await write(socket,Buffer.from([0x1d,0x56,0x00])); state.cut=true; await record({ ...state }); }
    await new Promise((resolve,reject)=>socket.end(resolve).once("error",reject));
    const completed={...state,status:"COMPLETED",success:true,message:"Receipt job completed.",updatedAt:new Date().toISOString()}; await record(completed); return completed;
  } catch (error) { socket?.destroy(); const failed={...state,status:"FAILED",success:false,message:error instanceof Error?error.message:"Printer job failed.",updatedAt:new Date().toISOString()}; await record(failed); return failed; }
}
function runIdempotent(job) { const existing=runningJobs.get(job.jobId); if(existing)return existing; const task=runJob(job).finally(()=>runningJobs.delete(job.jobId)); runningJobs.set(job.jobId,task); return task; }

createServer(async (request,response)=>{
  response.setHeader("Content-Type","application/json");
  if(request.method!=="POST"||request.url!=="/v1/jobs"){response.writeHead(404);response.end(JSON.stringify({success:false,message:"Not found."}));return;}
  if(!authorized(request.headers.authorization)){response.writeHead(401);response.end(JSON.stringify({success:false,message:"Unauthorized."}));return;}
  let raw=""; for await(const chunk of request){raw+=chunk;if(raw.length>128_000){response.writeHead(413);response.end(JSON.stringify({success:false,message:"Job is too large."}));return;}}
  try { const job=JSON.parse(raw); if(typeof job.jobId!=="string"||job.jobId.length>100||typeof job.receiptText!=="string"||![0,1].includes(job.drawerPin)){throw new Error("Invalid printer job.");} const result=await runIdempotent(job);response.writeHead(result.success?200:503);response.end(JSON.stringify(result)); }
  catch(error){response.writeHead(400);response.end(JSON.stringify({success:false,message:error instanceof Error?error.message:"Invalid printer job."}));}
}).listen(listenPort,listenHost,()=>console.log(`ESC/POS printer bridge listening on http://${listenHost}:${listenPort}`));
