TASK-006 — POS Billing System

Project:
Startek Restaurant POS

Client:
Rice & Kottu Hut

Developer:
Startek (PVT) LTD

Current Branch:
feature/pos

Completed Tasks:
- TASK-001 Project Setup
- TASK-002 Database
- TASK-003 Authentication
- TASK-004 Dashboard
- TASK-005 Menu Management

Objective:
Build a fast, modern, touch-friendly POS billing screen for restaurant cashiers.

IMPORTANT

This is NOT a supermarket POS.

This is a fast-food restaurant POS.

Speed is the highest priority.

----------------------------------------------------

Create Route

/pos

----------------------------------------------------

Layout

Three-column layout.

LEFT

Categories

CENTER

Menu Items

RIGHT

Shopping Cart

----------------------------------------------------

Categories

Display category buttons.

Rice

Kottu

Noodles

Fried Rice

Beverages

Desserts

Clicking a category filters products.

----------------------------------------------------

Menu Items

Display product cards.

Each card shows

Image

Item Name

Price

Availability

Large Add button

Unavailable items should be disabled.

----------------------------------------------------

Search

Search products instantly.

Typing should filter the menu.

----------------------------------------------------

Shopping Cart

Show

Item

Quantity

Unit Price

Line Total

Buttons

+

-

Remove

----------------------------------------------------

Order Details

Support:

Dine-In

Takeaway

Delivery

Only one can be selected.

----------------------------------------------------

Order Notes

Textarea

Example

"No onions"

----------------------------------------------------

Pricing

Calculate

Subtotal

Discount

Tax

Service Charge

Grand Total

Use the restaurant settings values.

----------------------------------------------------

Discount

Support

Percentage

Fixed Amount

Validation:

Cannot exceed subtotal.

----------------------------------------------------

Payment

Support

Cash

Card

QR

----------------------------------------------------

Cash Payment

Fields

Amount Received

Balance

Balance updates automatically.

----------------------------------------------------

Buttons

Clear Cart

Hold Order

Resume Order

Complete Order

Print Receipt (placeholder)

----------------------------------------------------

Validation

Prevent checkout when

Cart empty

Payment insufficient

Negative totals

----------------------------------------------------

Role Permissions

SUPER_ADMIN

Full access

OWNER

Full access

MANAGER

Full access

CASHIER

Can create orders

Cannot change tax settings

----------------------------------------------------

Responsive

Desktop

Tablet

Mobile

----------------------------------------------------

Components

Create reusable components

CategoryTabs

ProductCard

ProductGrid

CartItem

CartSummary

PaymentPanel

DiscountPanel

OrderTypeSelector

OrderNotes

CheckoutFooter

----------------------------------------------------

State

Use Zustand.

Persist cart until checkout.

----------------------------------------------------

Mock Data

Use Prisma menu items.

Do NOT hardcode products.

----------------------------------------------------

Performance

Instant category filtering.

Instant search.

No unnecessary re-renders.

----------------------------------------------------

Do NOT implement

Receipt generation

Reports

Expenses

Customer loyalty

Printer integration

----------------------------------------------------

Testing

Verify

Category filter

Search

Add product

Increase quantity

Decrease quantity

Remove item

Discount calculation

Tax calculation

Service charge

Cash balance

Order type selection

Responsive layout

Lint

Typecheck

Build

----------------------------------------------------

At completion provide

Files created

Components

State management

Routes

Testing results