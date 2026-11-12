import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";

const localEnvFiles = readdirSync(process.cwd()).filter(
  (name) => /^\.env(?:\.|$)/.test(name) && name !== ".env.example",
);

if (localEnvFiles.length > 0) {
  console.error("Build Netlify from a clean Git checkout and provide environment variables through Netlify. Local .env files can be bundled into the server function.");
  process.exit(1);
}

const result = spawnSync(
  process.execPath,
  ["node_modules/next/dist/bin/next", "build"],
  { stdio: "inherit", env: { ...process.env, POS_BUILD_TARGET: "cloud" } },
);
process.exit(result.status ?? 1);
