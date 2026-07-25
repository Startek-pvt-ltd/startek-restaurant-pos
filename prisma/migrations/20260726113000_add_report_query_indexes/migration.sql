-- Composite indexes for the date-bounded report workloads.
CREATE INDEX "Order_status_createdAt_idx" ON "Order"("status", "createdAt");
CREATE INDEX "Payment_paymentMethod_orderId_idx" ON "Payment"("paymentMethod", "orderId");
CREATE INDEX "Expense_category_expenseDate_idx" ON "Expense"("category", "expenseDate");
