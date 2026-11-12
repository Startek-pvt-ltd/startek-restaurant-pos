import assert from "node:assert/strict";
import test from "node:test";
import { strFromU8, unzipSync } from "fflate";

import { createCsv, createXlsx } from "../src/features/reports/utils/export-files";

const data = {
  title: "Test export",
  headers: ["Description", "Amount"],
  rows: [["  =1+1", -2], ["@SUM(1,2)", 0], ["ordinary text", 3]],
  totals: [],
};

test("CSV exports neutralize formula text without changing numeric cells", () => {
  const csv = createCsv(data, "", "");
  assert.match(csv, /^'  =1\+1,-2$/m);
  assert.match(csv, /^"'@SUM\(1,2\)",0$/m);
  assert.match(csv, /^ordinary text,3$/m);
});

test("Excel exports store spreadsheet-like strings as text, not formulas", () => {
  const worksheet = unzipSync(createXlsx(data, "", ""))["xl/worksheets/sheet1.xml"];
  assert.ok(worksheet);
  const sheet = strFromU8(worksheet);
  assert.match(sheet, /t="inlineStr"><is><t>  =1\+1<\/t>/);
  assert.doesNotMatch(sheet, /<f[ >]/);
});
