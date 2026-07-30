import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("browser receipt logo is a high-resolution 1-bit PNG", async () => {
  const png = await readFile("public/logos/rice-kottu-hut-receipt-monochrome.png");
  assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  assert.equal(png.readUInt32BE(16), 1280);
  assert.equal(png.readUInt32BE(20), 1056);
  assert.equal(png[24], 1);
  assert.equal(png[25], 3);
});

test("direct receipt logo is a centered 26 mm raster on a 576-dot canvas", async () => {
  const raster = await readFile("public/logos/rice-kottu-hut-receipt-576.bin");
  assert.deepEqual([...raster.subarray(0, 4)], [0x1d, 0x76, 0x30, 0x00]);
  const bytesPerRow = raster.readUInt16LE(4);
  const height = raster.readUInt16LE(6);
  assert.equal(bytesPerRow * 8, 576);
  assert.equal(raster.length, 8 + bytesPerRow * height);

  let minX = 576;
  let maxX = -1;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < 576; x += 1) {
      if ((raster[8 + y * bytesPerRow + (x >> 3)] ?? 0) & (0x80 >> (x & 7))) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
      }
    }
  }

  const contentWidth = maxX - minX + 1;
  assert.ok(contentWidth >= 176 && contentWidth <= 240);
  assert.ok(Math.abs(minX - (575 - maxX)) <= 8);
});
