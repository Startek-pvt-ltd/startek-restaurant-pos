"use client";

import { Search, ShoppingCart, Sparkles } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import { completeOrderAction } from "@/features/pos/actions/checkout-actions";
import { calculateBalance, calculateTotals } from "@/features/pos/lib/calculate-totals";
import { formatMoney } from "@/features/pos/lib/format-money";
import { usePosStore } from "@/features/pos/store/pos-store";
import type { PosCategory, PosProduct, RestaurantBillingSettings } from "@/features/pos/types";

import { CartItem } from "./CartItem";
import { CartSummary } from "./CartSummary";
import { CategoryTabs } from "./CategoryTabs";
import { CheckoutFooter } from "./CheckoutFooter";
import { DiscountPanel } from "./DiscountPanel";
import { OrderNotes } from "./OrderNotes";
import { OrderTypeSelector } from "./OrderTypeSelector";
import { PaymentPanel } from "./PaymentPanel";
import { ProductGrid } from "./ProductGrid";

interface PosBillingScreenProps {
  categories: PosCategory[];
  products: PosProduct[];
  settings: RestaurantBillingSettings;
}

export function PosBillingScreen({ categories, products, settings }: PosBillingScreenProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [lastOrder, setLastOrder] = useState<{ id: string; orderNumber: string; grandTotal: number } | null>(null);
  const [pending, startTransition] = useTransition();
  const checkoutLocked = useRef(false);

  const hydrated = usePosStore((state) => state.hydrated);
  const items = usePosStore((state) => state.items);
  const orderType = usePosStore((state) => state.orderType);
  const notes = usePosStore((state) => state.notes);
  const discountType = usePosStore((state) => state.discountType);
  const discountValue = usePosStore((state) => state.discountValue);
  const paymentMethod = usePosStore((state) => state.paymentMethod);
  const amountReceived = usePosStore((state) => state.amountReceived);
  const heldOrder = usePosStore((state) => state.heldOrder);
  const addItem = usePosStore((state) => state.addItem);
  const increaseItem = usePosStore((state) => state.increaseItem);
  const decreaseItem = usePosStore((state) => state.decreaseItem);
  const removeItem = usePosStore((state) => state.removeItem);
  const clearCart = usePosStore((state) => state.clearCart);
  const holdOrder = usePosStore((state) => state.holdOrder);
  const resumeOrder = usePosStore((state) => state.resumeOrder);
  const setOrderType = usePosStore((state) => state.setOrderType);
  const setNotes = usePosStore((state) => state.setNotes);
  const setDiscount = usePosStore((state) => state.setDiscount);
  const setPaymentMethod = usePosStore((state) => state.setPaymentMethod);
  const setAmountReceived = usePosStore((state) => state.setAmountReceived);
  const enabledMethods = useMemo(() => ([...(settings.allowCash ? ["CASH" as const] : []), ...(settings.allowCard ? ["CARD" as const] : []), ...(settings.allowQr ? ["QR" as const] : [])]), [settings.allowCard, settings.allowCash, settings.allowQr]);

  useEffect(() => {
    if (items.length === 0) setOrderType(settings.defaultOrderType);
    if (!enabledMethods.includes(paymentMethod)) setPaymentMethod(enabledMethods[0] ?? "CASH");
  }, [enabledMethods, items.length, paymentMethod, setOrderType, setPaymentMethod, settings.defaultOrderType]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return products.filter((product) => {
      const categoryMatches = selectedCategory === "all" || product.categoryId === selectedCategory;
      const searchMatches = !query || product.name.toLocaleLowerCase().includes(query) || product.categoryName.toLocaleLowerCase().includes(query);
      return categoryMatches && searchMatches;
    });
  }, [products, search, selectedCategory]);

  const catalogById = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);
  const reconciledItems = useMemo(
    () => items.map((item) => {
      const currentProduct = catalogById.get(item.id);
      return currentProduct ? { ...currentProduct, quantity: item.quantity } : item;
    }),
    [catalogById, items],
  );
  const cartHasInvalidItem = items.some((item) => {
    const product = catalogById.get(item.id);
    return !product || !product.available;
  });

  const totals = useMemo(() => calculateTotals({
    items: reconciledItems,
    discountType,
    discountValue,
    taxPercentage: settings.taxPercentage,
    serviceChargePercentage: settings.serviceChargePercentage,
  }), [discountType, discountValue, reconciledItems, settings.serviceChargePercentage, settings.taxPercentage]);
  const balance = calculateBalance(amountReceived, totals.grandTotal);
  const cartQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const paymentSufficient = paymentMethod !== "CASH" || balance >= 0;
  const discountWithinPolicy = settings.discountEnabled ? (discountType === "PERCENTAGE" ? discountValue <= settings.maximumPercentageDiscount : discountValue <= settings.maximumFixedDiscount) : discountValue === 0;
  const notesValid = !settings.requireOrderNotes || notes.trim().length > 0;
  const canComplete = items.length > 0 && !cartHasInvalidItem && totals.discountValid && discountWithinPolicy && notesValid && totals.totalsValid && paymentSufficient;
  const checkoutIssue = items.length === 0
    ? "Add an item to begin the order."
    : cartHasInvalidItem
      ? "Remove unavailable or deleted items before checkout."
      : !totals.discountValid || !discountWithinPolicy
        ? "Discount cannot exceed the subtotal."
        : !notesValid
          ? "Order notes are required."
        : !totals.totalsValid
          ? "Order total cannot be negative."
          : !paymentSufficient
            ? "Cash received is less than the grand total."
            : null;

  const handleAdd = useCallback((product: PosProduct) => addItem(product), [addItem]);

  const handleComplete = () => {
    if (checkoutLocked.current || pending) return;
    if (checkoutIssue) {
      toast.error(checkoutIssue);
      return;
    }

    checkoutLocked.current = true;
    startTransition(async () => {
      try {
        const result = await completeOrderAction({
          items: items.map((item) => ({ menuItemId: item.id, quantity: item.quantity })),
          orderType,
          notes,
          discountType,
          discountValue,
          paymentMethod,
          amountReceived: paymentMethod === "CASH" ? amountReceived : null,
        });

        if (!result.success) {
          toast.error(result.message);
          return;
        }

        setLastOrder({ id: result.orderId, orderNumber: result.orderNumber, grandTotal: result.grandTotal });
        clearCart();
        if (settings.autoOpenReceiptAfterCheckout || settings.autoPrintAfterCheckout) {
          window.location.assign(`/orders/${result.orderId}/receipt${settings.autoPrintAfterCheckout ? "?auto=1" : ""}`);
          return;
        }
        toast.success(result.message, {
          description: result.balance > 0 ? `Cash change due: ${formatMoney(result.balance, settings.currency)}.` : undefined,
        });
      } catch {
        toast.error("Checkout could not be completed. Check the connection and try again.");
      } finally {
        checkoutLocked.current = false;
      }
    });
  };

  if (!hydrated) {
    return <div className="grid animate-pulse gap-3 xl:grid-cols-[190px_minmax(0,1fr)_390px]"><div className="h-52 rounded-2xl bg-card" /><div className="h-[70vh] rounded-2xl bg-card" /><div className="h-[70vh] rounded-2xl bg-card" /></div>;
  }

  return (
    <div className="space-y-3 pb-4">
      {lastOrder && <section className="flex flex-col gap-2 rounded-2xl border border-success/25 bg-success/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between" role="status"><div className="flex items-center gap-2"><Sparkles aria-hidden="true" className="size-5 text-green-700" /><div><p className="text-sm font-black text-green-800">{lastOrder.orderNumber} completed</p><p className="text-xs text-green-700">Charged {formatMoney(lastOrder.grandTotal, settings.currency)}</p></div></div><button className="self-start text-xs font-black text-green-800 underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-success" onClick={() => setLastOrder(null)} type="button">Dismiss</button></section>}

      <div className="grid min-w-0 grid-cols-1 items-start gap-3 lg:grid-cols-[minmax(0,1fr)_370px] xl:grid-cols-[190px_minmax(0,1fr)_390px]">
        <div className="lg:col-span-2 xl:col-span-1"><CategoryTabs categories={categories} onSelect={setSelectedCategory} selectedId={selectedCategory} /></div>

        <section className="min-w-0 space-y-3" aria-label="Product selection">
          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1"><h1 className="text-xl font-black tracking-tight text-secondary">New Order</h1><p className="text-xs font-medium text-muted-foreground">{filteredProducts.length} items ready to browse</p></div>
            <label className="relative w-full sm:max-w-sm"><span className="sr-only">Search menu products</span><Search aria-hidden="true" className="absolute left-3.5 top-1/2 size-4.5 -translate-y-1/2 text-muted-foreground" /><input className="h-12 w-full rounded-xl border border-input bg-background/45 pl-10 pr-3 text-sm font-medium text-secondary outline-none transition placeholder:text-muted-foreground/65 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10" onChange={(event) => setSearch(event.target.value)} placeholder="Search menu items…" type="search" value={search} /></label>
          </div>
          <ProductGrid currency={settings.currency} onAdd={handleAdd} products={filteredProducts} />
        </section>

        <aside aria-label="Shopping cart" className="min-w-0 rounded-2xl border border-border bg-card shadow-[0_12px_36px_rgba(74,35,16,0.09)] xl:sticky xl:top-24 xl:max-h-[calc(100vh-7.5rem)] xl:overflow-y-auto dashboard-scrollbar">
          <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-border bg-card/95 px-4 py-3 backdrop-blur"><div className="flex items-center gap-2"><span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-white"><ShoppingCart aria-hidden="true" className="size-5" /></span><div><h2 className="font-black text-secondary">Shopping Cart</h2><p className="text-xs text-muted-foreground">Saved until checkout</p></div></div><span className="rounded-full bg-primary px-2.5 py-1 text-xs font-black text-secondary" aria-label={`${cartQuantity} cart items`}>{cartQuantity}</span></div>

          <div className="space-y-4 p-4">
            <OrderTypeSelector onChange={setOrderType} value={orderType} />

            {items.length === 0 ? <div className="rounded-xl border border-dashed border-input bg-background/35 px-4 py-8 text-center"><ShoppingCart aria-hidden="true" className="mx-auto size-7 text-muted-foreground/50" /><p className="mt-2 text-sm font-black text-secondary">Cart is empty</p><p className="mt-1 text-xs text-muted-foreground">Tap Add on a menu item.</p></div> : <ul aria-label="Cart items" className="max-h-80 space-y-2 overflow-y-auto pr-1 dashboard-scrollbar">{reconciledItems.map((item) => <CartItem currency={settings.currency} item={item} key={item.id} onDecrease={decreaseItem} onIncrease={increaseItem} onRemove={removeItem} />)}</ul>}

            <OrderNotes onChange={setNotes} value={notes} />
            <DiscountPanel onChange={setDiscount} type={discountType} valid={totals.discountValid} value={discountValue} />
            <CartSummary currency={settings.currency} discount={totals.discount} grandTotal={totals.grandTotal} serviceCharge={totals.serviceCharge} serviceChargePercentage={settings.serviceChargePercentage} subtotal={totals.subtotal} tax={totals.tax} taxPercentage={settings.taxPercentage} />
            <PaymentPanel amountReceived={amountReceived} currency={settings.currency} enabledMethods={enabledMethods} grandTotal={totals.grandTotal} method={paymentMethod} onAmountChange={setAmountReceived} onMethodChange={setPaymentMethod} />
            {checkoutIssue && <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800" role="status">{checkoutIssue}</p>}
            <CheckoutFooter canComplete={canComplete} canPrint={Boolean(lastOrder)} cartEmpty={items.length === 0} hasHeldOrder={Boolean(heldOrder)} onClear={() => { if (window.confirm("Clear every item from the current cart?")) { clearCart(); toast.success("Cart cleared."); } }} onComplete={handleComplete} onHold={() => { holdOrder(); toast.success("Order held on this device."); }} onPrint={() => { if (lastOrder) window.open(`/orders/${lastOrder.id}/receipt`, "_blank", "noopener,noreferrer"); }} onResume={() => { resumeOrder(); toast.success("Held order resumed."); }} pending={pending} />
          </div>
        </aside>
      </div>
    </div>
  );
}
