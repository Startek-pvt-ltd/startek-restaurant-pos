-- Replace the legacy category enum while preserving existing expense rows.
-- Legacy mappings: UTILITIES -> ELECTRICITY, PURCHASE -> INGREDIENTS,
-- and REPAIR -> MAINTENANCE.
CREATE TYPE "ExpenseCategory_new" AS ENUM (
    'INGREDIENTS',
    'PACKAGING',
    'GAS',
    'ELECTRICITY',
    'WATER',
    'SALARY',
    'TRANSPORT',
    'MAINTENANCE',
    'RENT',
    'MARKETING',
    'STAFF_MEALS',
    'OTHER'
);

ALTER TABLE "Expense"
ALTER COLUMN "category" TYPE "ExpenseCategory_new"
USING (
    CASE "category"::text
        WHEN 'UTILITIES' THEN 'ELECTRICITY'
        WHEN 'PURCHASE' THEN 'INGREDIENTS'
        WHEN 'REPAIR' THEN 'MAINTENANCE'
        ELSE "category"::text
    END
)::"ExpenseCategory_new";

DROP TYPE "ExpenseCategory";
ALTER TYPE "ExpenseCategory_new" RENAME TO "ExpenseCategory";

ALTER TABLE "Expense"
ADD COLUMN "expenseDate" DATE,
ADD COLUMN "referenceNumber" VARCHAR(100),
ADD COLUMN "updatedAt" TIMESTAMP(3);

UPDATE "Expense"
SET
    "expenseDate" = ("createdAt" AT TIME ZONE 'Asia/Colombo')::date,
    "updatedAt" = "createdAt";

ALTER TABLE "Expense"
ALTER COLUMN "expenseDate" SET NOT NULL,
ALTER COLUMN "updatedAt" SET NOT NULL,
ALTER COLUMN "title" TYPE VARCHAR(150);

CREATE INDEX "Expense_expenseDate_idx" ON "Expense"("expenseDate");
