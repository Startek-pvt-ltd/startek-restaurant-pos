# Rice & Kottu Hut Staff Training Guide

## Log in

1. Open `http://localhost:3000`.
2. Enter your own username and password.
3. Select **Login**.

Never share your password. Ask a manager to reset it if you forget it.

## Open the cash register

1. Open **Cash Closing**.
2. Count the starting cash.
3. Enter the opening cash and an optional note.
4. Select **Open Register**.

Do not start sales before the register is open. This feature requires TASK-016 on the installed branch.

## Create an order

1. Open **POS Billing**.
2. Select a category or search for an item.
3. Select an available item to add it to the cart.
4. Use **+** or **−** to change quantity.
5. Use **Remove** to remove an item.
6. Select **Dine-In**, **Takeaway**, or **Delivery**.
7. Add an order note only when needed.

## Accept payment

- **Cash:** select Cash, enter the amount received, and check the balance.
- **Card:** confirm the terminal payment, then select Card.
- **QR:** confirm the QR payment, then select QR.

Check the grand total before selecting **Complete Order**. Do not close the browser during checkout.

## Print and reprint receipts

After checkout, open the receipt and select print. Choose **Xprinter XP-80T**, 80 mm paper, 100% scale, no margins, and disable browser headers and footers. To reprint, open **Orders**, select the invoice, and choose the reprint action.

Do not unplug the printer while printing.

## Add an expense

1. Open **Expenses**.
2. Select **Add Expense**.
3. Enter the title, category, amount, payment method, date, and useful notes.
4. Save and check the success message.

Choose the correct payment method. Cash expenses affect cash reconciliation.

## View notifications

Select the bell icon. Read new operational messages and open the linked record when needed.

## Close the cash register

1. Stop taking new orders.
2. Open **Cash Closing** and count the physical cash.
3. Enter the actual cash, closing note, and your password.
4. Review the expected cash and difference.
5. Confirm close and print the summary.

## Log out and shut down

Select **Logout** when leaving the POS. At the end of the day, create a backup and run `./scripts/stop-pos.sh` before switching off the Mac.

Do not switch off the Mac without stopping the POS. Call Startek if database or printing errors occur.
