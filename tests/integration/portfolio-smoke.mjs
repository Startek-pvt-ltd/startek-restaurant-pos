import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import bcrypt from "bcryptjs";
import pg from "pg";
import { chromium } from "playwright";

const database = new URL(process.env.DATABASE_URL ?? "");
const base = new URL(process.env.AUTH_URL ?? "");
assert.ok(["localhost", "127.0.0.1", "[::1]"].includes(database.hostname));
assert.match(database.pathname, /^\/startek_portfolio_[a-f0-9]+$/);
assert.equal(base.origin, process.env.PORTFOLIO_TEST_ORIGIN ?? "http://localhost:3107");
const db = new pg.Client({ connectionString: database.toString() });
const browser = await chromium.launch(process.env.PORTFOLIO_CHROME_CHANNEL ? { channel: process.env.PORTFOLIO_CHROME_CHANNEL } : {});
const media = process.env.PORTFOLIO_MEDIA_DIR;
const run = Date.now();
const accounts = [];
const orders = [];

async function signIn(context, identifier, password) {
  const { csrfToken } = await (await context.request.get("/api/auth/csrf")).json();
  const result = await context.request.post("/api/auth/callback/credentials", {
    form: { csrfToken, identifier, password, rememberMe: "false", callbackUrl: base.origin + "/dashboard" },
    headers: { "X-Auth-Return-Redirect": "1" },
  });
  assert.equal(result.status(), 200);
  const session = await (await context.request.get("/api/auth/session")).json();
  assert.equal(session.user.username, identifier);
  return session.user;
}

async function open(page, url) {
  const response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });
  assert.equal(response.status(), 200, url);
  assert.equal(new URL(page.url()).pathname, new URL(url, base).pathname, url);
}

try {
  await db.connect();
  const { rows: [scope] } = await db.query("SELECT current_database() AS name");
  assert.equal(scope.name, database.pathname.slice(1));
  assert.equal((await db.query('SELECT count(*)::int AS n FROM "Order"')).rows[0].n, 0, "Start with a freshly seeded disposable database.");
  await db.query('UPDATE "User" SET "fullName"=$1 WHERE username=$2', ["Demo Administrator", "admin"]);
  await db.query('UPDATE "Restaurant" SET address=$1, "addressLine1"=$1, "addressLine2"=NULL, city=$2, phone=$3, "phone2"=$3, email=NULL, "taxNumber"=NULL', ["Demo venue", "Demo location", "0000000000"]);
  await db.query('UPDATE "SystemSetting" SET "autoOpenReceiptAfterCheckout"=false, "autoPrintAfterCheckout"=false, "printLogo"=true, "invoicePrefix"=$1', ["DEMO"]);
  for (const role of ["OWNER", "MANAGER", "CASHIER"]) {
    const username = "demo-" + role.toLowerCase() + "-" + run;
    const password = randomBytes(24).toString("base64url") + "!Aa7";
    const id = randomUUID();
    await db.query('INSERT INTO "User" (id, username, "fullName", password, role, status, "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,now())',
      [id, username, "Demo " + role[0] + role.slice(1).toLowerCase(), await bcrypt.hash(password, 12), role, "ACTIVE"]);
    accounts.push({ id, username, password, role });
  }

  const desktop = await browser.newContext({ baseURL: base.origin, viewport: { width: 1440, height: 1000 } });
  assert.equal((await desktop.request.get("/pos", { maxRedirects: 0 })).status(), 307);
  const user = await signIn(desktop, "admin", process.env.SEED_SUPER_ADMIN_PASSWORD);
  assert.equal(user.role, "SUPER_ADMIN");
  const page = await desktop.newPage();
  await page.addInitScript(() => { window.print = () => { window.__prints = (window.__prints ?? 0) + 1; }; });
  await open(page, "/dashboard");
  await page.getByText("No orders recorded.", { exact: true }).waitFor();
  await open(page, "/menu/categories");
  await page.getByRole("button", { name: "Add Category", exact: true }).click();
  const categoryName = "Demo Specials " + run;
  await page.locator('input[name="name"]').fill(categoryName);
  await page.getByRole("button", { name: "Create category", exact: true }).click();
  await page.getByText(categoryName, { exact: true }).first().waitFor();
  await open(page, "/expenses");
  await page.getByRole("button", { name: "Add Expense", exact: true }).click();
  const expenseDialog = page.getByRole("dialog");
  await expenseDialog.waitFor({ state: "visible" });
  await expenseDialog.locator('input[name="title"]').fill("Demo packaging");
  await expenseDialog.locator('input[name="amount"]').fill("125.00");
  await expenseDialog.locator('select[name="category"]').selectOption("PACKAGING");
  assert.equal(await expenseDialog.locator('input[name="title"]').inputValue(), "Demo packaging");
  assert.equal(await expenseDialog.locator('input[name="amount"]').inputValue(), "125.00");
  await expenseDialog.getByRole("button", { name: "Create expense", exact: true }).click();
  try {
    await page.getByText("Demo packaging", { exact: true }).filter({ visible: true }).first().waitFor({ timeout: 15000 });
  } catch (error) {
    const rows = await db.query('SELECT COUNT(*)::int AS n FROM "Expense" WHERE title = $1', ["Demo packaging"]);
    console.error("Synthetic expense row count:", rows.rows[0]?.n);
    console.error("Expense modal feedback:", (await page.getByRole("dialog").allTextContents()).map((t) => t.slice(0, 700)));
    console.error("Expense alerts:", (await page.getByRole("alert").allTextContents()).map((t) => t.slice(0, 500)));
    console.error("Expenses table state:", (await page.locator('section[aria-label="Expenses"]').allTextContents()).map((t) => t.slice(0, 500)));
    throw error;
  }
  console.log("Admin sign-in, empty dashboard, category creation and expense recording passed.");

  for (const method of ["Cash", "Card", "QR"]) {
    await open(page, "/pos");
    await page.getByRole("button", { name: "Add", exact: true }).first().click();
    const dialog = page.getByRole("dialog");
    if (await dialog.count()) await dialog.getByRole("button").last().click();
    await page.getByRole("button", { name: method, exact: true }).click();
    if (method === "Cash") await page.getByRole("button", { name: "Exact", exact: true }).click();
    const note = "Synthetic portfolio checkout " + method;
    await page.getByLabel("Order notes").fill(note);
    const action = page.waitForResponse((response) => {
      const req = response.request();
      return req.method() === "POST" && req.headers()["next-action"] && req.postData()?.includes(note);
    });
    await page.getByRole("button", { name: "Complete Order", exact: true }).dblclick();
    const response = await action;
    assert.match(await response.text(), /"success":true/);
    if (method === "Cash") {
      const request = response.request();
      const headers = Object.fromEntries(Object.entries(request.headers()).filter(([key]) => ["next-action", "next-router-state-tree", "content-type", "accept", "origin"].includes(key)));
      const replay = () => desktop.request.post(request.url(), { headers, data: request.postData() });
      for (const repeated of await Promise.all([replay(), replay()])) assert.match(await repeated.text(), /"success":true/);
    }
    const { rows } = await db.query(`
      SELECT o.id, o."orderNumber", o."grandTotal"::text AS total, o.subtotal::text, p.amount::text,
        p."paymentMethod"::text AS method, p."paymentStatus"::text AS status, i."itemName", i."menuItemId"
      FROM "Order" o JOIN "Payment" p ON p."orderId"=o.id JOIN "OrderItem" i ON i."orderId"=o.id
      WHERE o.notes=$1`, [note]);
    assert.equal(rows.length, 1);
    const order = rows[0];
    assert.equal(order.method, method.toUpperCase());
    assert.equal(order.status, "PAID");
    assert.equal(order.total, order.amount);
    assert.equal(order.total, order.subtotal);
    assert.ok(order.itemName);
    assert.ok(!orders.some((previous) => previous.orderNumber === order.orderNumber));
    orders.push(order);
  }
  console.log("Cash, card and QR reconciled with unique invoices; concurrent cash replays created one order and payment.");

  const first = orders[0];
  await db.query('UPDATE "MenuItem" SET name=$1 WHERE id=$2', [first.itemName + " (renamed)", first.menuItemId]);
  await open(page, "/orders/" + first.id + "/receipt");
  await page.locator(".receipt-80").getByText(first.itemName, { exact: false }).first().waitFor();
  assert.equal(await page.locator(".receipt-80").getByText(first.itemName + " (renamed)").count(), 0);
  assert.equal(await page.evaluate(() => window.__prints ?? 0), 0);
  const exportResponse = await desktop.request.get("/settings/data-export/download?dataset=order-items&format=json");
  assert.equal(exportResponse.status(), 200);
  assert.ok((await exportResponse.json()).records.some((row) => row.order.orderNumber === first.orderNumber && row.menuItem.name === first.itemName));
  const report = await desktop.request.get("/reports/export/sales?format=csv&preset=today");
  assert.equal(report.status(), 200);
  const csv = await report.text();
  for (const order of orders) assert.ok(csv.includes(order.orderNumber));
  console.log("Receipt and export retain checkout-time item name after a rename; sales report contains all invoices.");

  for (const account of accounts) {
    const context = await browser.newContext({ baseURL: base.origin, viewport: { width: 390, height: 844 } });
    const role = await signIn(context, account.username, account.password);
    assert.equal(role.role, account.role);
    const mobile = await context.newPage();
    await open(mobile, "/pos");
    assert.equal(await mobile.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    const reportStatus = await context.request.get("/reports", { maxRedirects: 0 });
    assert.equal(reportStatus.status(), account.role === "CASHIER" ? 307 : 200);
    if (account.role === "CASHIER") {
      assert.equal((await context.request.get("/settings/data-export/download?dataset=staff&format=json", { maxRedirects: 0 })).status(), 307);
      await db.query('UPDATE "User" SET status=$1, "sessionVersion"="sessionVersion"+1 WHERE id=$2', ["INACTIVE", account.id]);
      assert.equal((await context.request.get("/pos", { maxRedirects: 0 })).status(), 307);
    }
    await context.close();
  }
  const logoutContext = await browser.newContext({ baseURL: base.origin });
  await signIn(logoutContext, "admin", process.env.SEED_SUPER_ADMIN_PASSWORD);
  const { csrfToken: logoutCsrf } = await (await logoutContext.request.get("/api/auth/csrf")).json();
  assert.ok(logoutCsrf);
  await logoutContext.request.post("/api/auth/signout", { form: { csrfToken: logoutCsrf, callbackUrl: base.origin + "/login" } });
  assert.equal((await logoutContext.request.get("/pos", { maxRedirects: 0 })).status(), 307);
  await logoutContext.close();
  console.log("All approved roles, mobile POS, denied cashier exports, logout and deactivation passed.");

  await open(page, "/settings/backup");
  await page.getByRole("button", { name: "Create full backup" }).click();
  await page.getByText("Full database backup completed and verified.", { exact: true }).waitFor({ timeout: 25000 });
  console.log("Application created and verified an isolated PostgreSQL backup.");

  if (media) {
    await mkdir(media, { recursive: true });
    for (const [name, width, height, route] of [
      ["dashboard-desktop", 1440, 1000, "/dashboard"],
      ["pos-tablet", 820, 1180, "/pos"],
      ["pos-mobile", 390, 844, "/pos"],
      ["receipt-desktop", 1440, 950, "/orders/" + first.id + "/receipt"],
    ]) {
      await page.setViewportSize({ width, height });
      await open(page, route);
      await page.evaluate(() => document.fonts.ready);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, name);
      await page.screenshot({ path: path.join(media, name + ".jpg"), type: "jpeg", quality: 83, animations: "disabled" });
    }
    console.log("Captured desktop, tablet, mobile and receipt screenshots from disposable demo records.");
  }
} finally {
  await browser.close();
  await db.end();
}
