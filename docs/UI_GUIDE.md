# UI Guide

## Thermal receipt

- Target paper: 80 mm; printable receipt width: 72 mm.
- Receipt output is monochrome, monospace, and free of background colors or dashboard chrome.
- Receipt sections and item rows avoid internal page breaks.
- Users select `Xprinter XP-80T` and `80 mm` paper in the operating system print dialog.
- Monetary columns use tabular numerals, long item names wrap, and Cash-only tender/change fields are omitted for Card and QR payments.
- The preview toolbar returns to both order details and POS; all toolbar and dashboard elements are excluded from print output.

## Brand palette

- Primary gold: `#F4B400`
- Dark brown: `#4A2310`
- Cream background: `#FFF8E6`
- White cards: `#FFFFFF`
- Success green: `#22C55E`
- Warning orange: `#F97316`
- Error red: `#EF4444`

Use cream for page backgrounds, white for elevated surfaces, dark brown for readable text, and gold for primary actions and emphasis. Preserve the logo aspect ratio and original artwork.

## Dashboard patterns

- Use large rounded white cards, subtle brown-tinted shadows, and restrained gold accents.
- Keep the authenticated application sidebar fixed on desktop and available as a dismissible drawer on tablet and mobile.
- Always show visible keyboard focus states for links, buttons, form controls, and drawer actions.
- Use concise labels and readable status badges with sufficient foreground/background contrast.
- Format monetary mock values in Sri Lankan rupees using `Rs.` and two decimal places.
- Dashboard visualizations use Recharts and must include meaningful accessible labels.

## Approved navigation

Dashboard, POS Billing, Menu Management, Orders, Customers, Reports, Expenses, Staff, Settings, and Logout.

Do not display table-management, kitchen-display, inventory, or supplier features.
