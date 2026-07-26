# UI Guide

## Approved navigation

The sidebar order is: Dashboard, POS Billing, Menu Management, Orders, Reports, Expenses, Staff, Settings, and Logout.

Categories are managed inside Menu Management and do not receive a separate top-level item. Customer, table, kitchen, inventory, supplier, and marketplace-specific links/content are prohibited.

## Responsive shell

- Desktop/tablet: the 288 px sidebar collapses to an 80 px icon rail, exposes accessible tooltips, and persists the preference in local browser storage.
- Mobile: keyboard-accessible navigation drawer with overlay, explicit close controls, and automatic close after navigation.
- Tables use horizontal scrolling instead of clipping required columns.
- POS stacks category, products, and cart content at narrower widths while preserving touch-sized controls.

## Brand and accessibility

- Gold `#F4B400`, dark brown `#4A2310`, cream `#FFF8E6`, white `#FFFFFF`
- Success `#22C55E`, warning `#F97316`, danger `#EF4444`
- Use visible focus rings, semantic headings, accessible names, sufficient contrast, labeled form fields, and status/alert roles.
- Use reduced-motion preferences, lazy menu images, large rounded cards, and restrained shadows/animation.
- Format LKR as `Rs. 1,250.00`.

## Reports and analytics

Reports use the authenticated dashboard shell plus a horizontally scrollable section switcher for Overview, Sales, Menu Items, Payments, Cashiers, and Expenses. Filters submit with `GET`, remain in the URL, and use labelled controls with visible focus states.

Summary cards stack on mobile, charts remain within responsive containers, and wide tables scroll horizontally. Charts include accessible text summaries and never rely on color alone. Empty, loading, invalid-filter, and database-error states use plain-language guidance.

Management printing uses a named A4 landscape page, black text, visible restaurant/report/date metadata, summary cards, report tables, and a Startek footer. Sidebar, topbar, filters, export buttons, pagination, and interactive charts are hidden. The separate named receipt page retains its 80 mm Xprinter layout.

## Staff and profile

Staff uses the authenticated dashboard shell with a branded header, statistics, URL-backed search/filter/sort controls, desktop table, mobile cards, and accessible focus-trapped dialogs. Role/status badges include text and do not rely on color alone. Create/edit/reset/status controls appear only when the current role can manage the target, while the server independently repeats every permission check.

The staff form never offers KITCHEN. Password fields appear only during creation/reset/change and are never preloaded. Deactivation confirmations state that sessions are revoked and historical records remain. `/settings/profile` is linked from the topbar identity control and provides separate profile and current-password-verified password forms.

## Thermal receipt

- Target: Xprinter XP-80T, 80 mm paper, 74 mm receipt width with 2 mm internal padding.
- Monochrome Times New Roman at 12 px/600 weight, minimal margins, strong separators, and no dashboard/background output.
- Item columns: Item, Qty, Total.
- Never show customer information.
- Hide discount, tax, and service-charge lines when their values are zero.
- Show amount received and balance only for cash.
- Prevent page breaks inside receipt sections/item rows.
- Header: Rice & Kottu Hut; No.32, Padukka Road, Meegoda; 0777250493 / 0778375427.
- Footer: Thank You! / Please Visit Again / Design & Deploy by / Startek (PVT) LTD.

Users select Xprinter XP-80T and 80 mm paper in the operating-system print dialog. Direct printer/cash-drawer communication is not implemented.

## Settings UI

The responsive settings navigation links overview, restaurant, receipt, billing, printer, system, and profile screens. Forms expose visible focus states, disabled/read-only role states, saving feedback, and toast results. Discount, tax, and service-charge billing controls are disabled from the active workflow. Receipt settings include a live sample; printer settings include a browser print test and five-step system-dialog guide. Both 80 mm and future 58 mm styles are available.
