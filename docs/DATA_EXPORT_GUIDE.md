# Data export guide

`/settings/data-export` provides Orders, Order Items, Payments, Menu Items, Categories, Expenses, Staff metadata, Activity Logs, and Configuration Settings in CSV, Excel, or JSON. Date, order status/type, payment method, cashier, and expense-category filters apply where relevant.

Staff exports include full name, username, email, phone, role, status, last login, and creation date. They never select password hashes or session versions. Configuration exports contain restaurant, billing, receipt, printer-label, and application preferences, but exclude database URLs, authentication/session secrets, encryption keys, and private backup paths.

SUPER_ADMIN, OWNER, and MANAGER may export approved data. CASHIER access is denied by the page and download handler. Every completed export writes `DATA_EXPORTED` to `ActivityLog`.

Exports are point-in-time business extracts, not database backups. JSON output must not be renamed and treated as a restorable PostgreSQL dump.
