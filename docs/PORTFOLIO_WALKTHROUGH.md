# Portfolio walkthrough

The demo uses a fresh, isolated database with synthetic transactions and staff labels. The hosted staging environment is access controlled. Use the [recorded walkthrough](portfolio/walkthrough.webm) and [screenshots](../README.md#demo-media) to review the workflows without signing in.

1. **Dashboard.** Start with order, payment and expense summaries. The recent order list links to the saved invoice and the best-seller panel uses completed sales.
2. **POS.** Add an item and choose its size if offered. Review the cart and select cash, card or QR. The server prices the order and records the selected tender.
3. **Receipt.** Open the 80 mm receipt to review the invoice, quantities, payment and total. The order-line name and price remain stable if the menu changes.
4. **Operations.** Review categories and availability, record an expense, or use a reporting export. Cashier and management access differ.
5. **Deployment boundary.** The cloud demo renders browser receipts. Physical printer, drawer and cutter behavior belongs to local acceptance testing.

The [case study](PORTFOLIO_CASE_STUDY.md) explains the engineering choices. The [release report](PORTFOLIO_RELEASE.md) identifies verified behavior and remaining gates.
