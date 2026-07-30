# Windows 80 mm thermal printer setup

## Browser mode

Browser printing cannot send ESC/POS drawer or cutter commands. In the Windows printer preferences select the 80 mm roll, 100% scale, zero margins, disabled browser headers/footers, and enable **Cut after document** (or the equivalent driver option).

## Direct ESC/POS bridge mode

The included bridge is a loopback-only Node.js service for a network-accessible ESC/POS printer using raw TCP port 9100. Configure `PRINTER_BRIDGE_URL`, a random `PRINTER_BRIDGE_TOKEN` of at least 32 characters, `ESC_POS_PRINTER_HOST`, and optionally the printer and bridge ports in `.env`. Start it with `npm run printer:bridge` under a dedicated Windows service account, then select **Direct ESC/POS bridge** in Printer Settings.

The application server sends a deterministic order job ID. The bridge persists job outcomes and will not resend a completed or failed order job. It sends receipt bytes first, then the configured RJ11/RJ12 drawer pulse, then one full-cut command. Cash-only drawer mode is the default. Test-print and drawer-test actions require owner access; bridge tokens and printer addresses never reach cashier browsers.

If the bridge or printer is offline, the completed order remains saved, the cart is cleared to prevent duplication, and the cashier receives a printing error. The receipt can still be opened from the saved order and printed through the browser fallback.
