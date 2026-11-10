# Windows 80 mm thermal printer setup

## Browser mode

Browser printing cannot send ESC/POS drawer or cutter commands. In the Windows printer preferences select the 80 mm roll, 100% scale, zero margins, disabled browser headers/footers, and enable **Cut after document** (or the equivalent driver option).

## Direct ESC/POS bridge mode

The included bridge is a loopback-only Node.js service for a network-accessible ESC/POS printer using raw TCP port 9100. Configure `PRINTER_BRIDGE_URL`, a random `PRINTER_BRIDGE_TOKEN` of at least 32 characters, `ESC_POS_PRINTER_HOST`, and optionally the printer and bridge ports in `.env`. `ESC_POS_PRINTER_DOT_WIDTH` defaults to the common 80 mm printable width of 576 dots and must match the prepared receipt logo raster. Start it with `npm run printer:bridge` under a dedicated Windows service account, then select **Direct ESC/POS bridge** in Printer Settings.

The application server sends a deterministic order job ID. The bridge persists job outcomes and will not resend a completed or failed order job. When logo printing is enabled, it sends the prepared 1-bit, 576-dot-wide monochrome raster before the receipt text, then the configured RJ11/RJ12 drawer pulse, then one full-cut command. Cash-only drawer mode is the default. Test-print and drawer-test actions require owner access; bridge tokens and printer addresses never reach cashier browsers.

## Receipt logo assets

Browser receipts use `public/logos/rice-kottu-hut-receipt-monochrome.png`, a 1280×1056 1-bit PNG rendered unoptimized at 26 mm wide. Printing waits for the image to load and decode before opening the browser dialog. Direct printing uses `public/logos/rice-kottu-hut-receipt-576.bin`, a pre-thresholded ESC/POS raster with the approximately 26 mm logo centered on a 576-dot canvas; the companion PNG is retained for inspection. Both assets have an opaque white background and omit the original fine-print tagline that would not reproduce reliably on a thermal head.

If the bridge or printer is offline, the completed order remains saved, the cart is cleared to prevent duplication, and the cashier receives a printing error. The receipt can still be opened from the saved order and printed through the browser fallback.
