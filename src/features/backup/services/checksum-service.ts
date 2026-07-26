import "server-only";import { createHash } from "node:crypto";import { createReadStream } from "node:fs";
export async function sha256File(filePath:string){const hash=createHash("sha256");for await(const chunk of createReadStream(/*turbopackIgnore: true*/ filePath))hash.update(chunk as Buffer);return hash.digest("hex")}
