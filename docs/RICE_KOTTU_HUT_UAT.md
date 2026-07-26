# Rice & Kottu Hut User Acceptance Testing

Complete this sheet on the restaurant MacBook using non-production-value test orders. Do not mark printer or cash-closing tests passed without observing the physical result.

| Test ID | Feature | Test Steps | Expected Result | Actual Result | Pass/Fail | Tested By | Test Date | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| UAT-001 | Login | Sign in with an active staff account, then try an invalid password. | Valid login opens Dashboard; invalid password is rejected. |  |  |  |  |  |
| UAT-002 | Category filter | Open POS and select each category. | Only matching available items appear immediately. |  |  |  |  |  |
| UAT-003 | Menu selection | Add an available item and try an unavailable item. | Available item enters cart; unavailable item cannot be added. |  |  |  |  |  |
| UAT-004 | Product search | Search by full and partial product name. | Matching products appear without page reload. |  |  |  |  |  |
| UAT-005 | Dine-In | Complete a Dine-In test order. | Order is saved with DINE_IN and correct subtotal-only total. |  |  |  |  |  |
| UAT-006 | Takeaway | Complete a Takeaway test order. | Order is saved with TAKEAWAY. |  |  |  |  |  |
| UAT-007 | Delivery | Complete a Delivery test order. | Order is saved with DELIVERY. |  |  |  |  |  |
| UAT-008 | Cash payment | Complete cash payment with an amount above total. | Order completes; received amount and balance are correct. |  |  |  |  |  |
| UAT-009 | Card payment | Complete a Card order. | Order completes; receipt hides cash received/balance. |  |  |  |  |  |
| UAT-010 | QR payment | Complete a QR order. | Order completes; receipt hides cash received/balance. |  |  |  |  |  |
| UAT-011 | Order history | Search the test invoice and open details. | Saved items, payment, cashier, order type, and total match. |  |  |  |  |  |
| UAT-012 | Receipt reprint | Reprint a completed order. | Browser print dialog opens with the same invoice. |  |  |  |  |  |
| UAT-013 | Expense entry | Record Cash and Card test expenses. | Both save; only Cash affects drawer when Cash Closing is available. |  |  |  |  |  |
| UAT-014 | Cash Closing | Open, transact, reconcile, close, and print a session. | Expected cash is correct and closed totals remain immutable. |  |  |  |  | Blocked until TASK-016 is merged. |
| UAT-015 | Reports | Compare today’s sales/payment/expense totals to test records. | Reports match completed, non-cancelled records. |  |  |  |  |  |
| UAT-016 | Notifications | Complete an order and change menu availability. | Appropriate notifications appear without sensitive details. |  |  |  |  |  |
| UAT-017 | Sidebar | Collapse/expand on desktop and open/close on mobile width. | Navigation remains accessible without overlap. |  |  |  |  |  |
| UAT-018 | Printer output | Complete the five cases in the printer checklist. | Every physical receipt meets the 80 mm acceptance criteria. |  |  |  |  |  |
| UAT-019 | Backup creation | Create backup, verify completed status, size, and download. | Non-empty private backup is recorded and downloadable by an authorized role. |  |  |  |  |  |
| UAT-020 | Permissions | Test Cashier allowed and restricted routes/actions. | Allowed pages work; Staff, restore, protected settings, restricted reports, and expense delete are denied. |  |  |  |  |  |
