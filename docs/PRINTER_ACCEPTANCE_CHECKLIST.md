# Xprinter XP-80T Acceptance Checklist

Use the browser/system print dialog. The application does not communicate directly with the USB printer.

## Printer setup

- [ ] Xprinter XP-80T is installed and selected.
- [ ] Paper size is 80 mm.
- [ ] Scale is 100%.
- [ ] Margins are None.
- [ ] Browser headers and footers are disabled.
- [ ] One receipt prints with no trailing empty page.

## Test receipts

| Case | Order setup | Expected result | Actual result | Pass/Fail |
| --- | --- | --- | --- | --- |
| PRN-001 | Dine-In + Cash | Order type shown; Received and Balance shown. |  |  |
| PRN-002 | Takeaway + Card | Card shown; cash fields hidden. |  |  |
| PRN-003 | Delivery + QR | QR shown; cash fields hidden. |  |  |
| PRN-004 | Multiple menu items | Every item, quantity, and total remains aligned. |  |  |
| PRN-005 | Long menu item name | Name wraps inside Item column without moving Qty/Total outside paper. |  |  |

For every case verify Times New Roman, dark black text, Item/Qty/Total columns, prominent Grand Total, correct restaurant identity, and visible `Design & Deploy by Startek (PVT) LTD` credit.

Physical results remain pending until these receipts are printed on the restaurant’s Xprinter XP-80T.
