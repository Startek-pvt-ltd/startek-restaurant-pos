import assert from "node:assert/strict";
import test from "node:test";

import {
  categoryDeleteMode,
  menuItemDeleteMode,
} from "../src/features/menu/services/deletion-policy";

test("unused menu items are permanently deleted", () => {
  assert.equal(menuItemDeleteMode(0), "hard-delete");
});

test("historically referenced menu items are archived", () => {
  assert.equal(menuItemDeleteMode(1), "archive");
  assert.equal(menuItemDeleteMode(25), "archive");
});

test("empty categories are permanently deleted", () => {
  assert.equal(categoryDeleteMode(0, 0), "hard-delete");
});

test("categories containing active menu items are blocked", () => {
  assert.equal(categoryDeleteMode(1, 1), "blocked");
  assert.equal(categoryDeleteMode(2, 5), "blocked");
});

test("categories containing only archived items are archived", () => {
  assert.equal(categoryDeleteMode(0, 1), "archive");
  assert.equal(categoryDeleteMode(0, 8), "archive");
});
