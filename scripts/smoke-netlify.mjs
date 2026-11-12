#!/usr/bin/env node
/**
 * Validate a published Netlify POS package, including assets that are easy to
 * omit when deploying .next instead of .netlify/static.
 * Usage: node scripts/smoke-netlify.mjs https://your-site.netlify.app
 */
const origin = process.argv[2];
if (!origin) {
  console.error("Usage: node scripts/smoke-netlify.mjs https://your-site.netlify.app");
  process.exit(64);
}
let site;
try {
  site = new URL(origin);
  if (site.protocol !== "https:" || site.pathname !== "/" || site.search || site.hash) throw new Error("invalid");
} catch {
  console.error("Provide a bare HTTPS deployment origin, without a path or query.");
  process.exit(64);
}

async function get(path, options = {}) {
  const response = await fetch(new URL(path, site), { redirect: "manual", signal: AbortSignal.timeout(20_000), ...options });
  return response;
}
function assert(ok, reason) {
  if (!ok) throw new Error(reason);
}
try {
  const login = await get("/login");
  assert(login.status === 200, `GET /login returned ${login.status}`);
  const html = await login.text();
  const css = html.match(/href="(\/_next\/static\/[^"]+\.css)"/);
  assert(css, "Login HTML did not reference a Next.js stylesheet");
  const style = await get(css[1]);
  assert(style.status === 200, `Stylesheet returned ${style.status}: ${css[1]}`);
  assert((style.headers.get("content-type") || "").includes("text/css"), "Stylesheet has the wrong content type");

  const logoPath = "/logos/rice-kottu-hut-logo.png";
  const logo = await get(logoPath);
  assert(logo.status === 200, `Restaurant logo returned ${logo.status}`);
  assert((logo.headers.get("content-type") || "").includes("image/"), "Restaurant logo has the wrong content type");

  const health = await get("/api/health");
  assert(health.status === 200, `API health returned ${health.status}`);
  const status = await health.json();
  assert(status.status === "ok" && status.database === "connected", "Application or PostgreSQL is not healthy");

  const protectedPage = await get("/dashboard");
  assert([302, 303, 307, 308].includes(protectedPage.status), "Dashboard did not redirect anonymous user");
  const destination = protectedPage.headers.get("location") || "";
  assert(destination.startsWith("/login") || destination.startsWith(site.origin + "/login"), "Dashboard did not redirect to login");
  const env = await get("/.env");
  assert(env.status === 404, "A local dotenv path is publicly accessible");

  console.log("PASS: login HTML, stylesheet, logo, database, protected route and private-path checks");
  console.log("Verified origin:", site.origin);
} catch (error) {
  console.error("FAIL:", error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
