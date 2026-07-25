"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type {
  CartLine,
  DiscountType,
  PosOrderType,
  PosPaymentMethod,
  PosProduct,
} from "../types";

type HeldOrder = {
  items: CartLine[];
  orderType: PosOrderType;
  notes: string;
  discountType: DiscountType;
  discountValue: number;
};

interface PosStore {
  items: CartLine[];
  orderType: PosOrderType;
  notes: string;
  discountType: DiscountType;
  discountValue: number;
  paymentMethod: PosPaymentMethod;
  amountReceived: number;
  heldOrder: HeldOrder | null;
  hydrated: boolean;
  addItem: (product: PosProduct) => void;
  increaseItem: (id: string) => void;
  decreaseItem: (id: string) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  holdOrder: () => void;
  resumeOrder: () => void;
  setOrderType: (orderType: PosOrderType) => void;
  setNotes: (notes: string) => void;
  setDiscount: (discountType: DiscountType, discountValue: number) => void;
  setPaymentMethod: (paymentMethod: PosPaymentMethod) => void;
  setAmountReceived: (amountReceived: number) => void;
  setHydrated: (hydrated: boolean) => void;
}

const activeOrderDefaults = {
  items: [] as CartLine[],
  orderType: "TAKEAWAY" as PosOrderType,
  notes: "",
  discountType: "PERCENTAGE" as DiscountType,
  discountValue: 0,
  paymentMethod: "CASH" as PosPaymentMethod,
  amountReceived: 0,
};

export const usePosStore = create<PosStore>()(
  persist(
    (set, get) => ({
      ...activeOrderDefaults,
      heldOrder: null,
      hydrated: false,
      addItem: (product) => {
        if (!product.available) return;
        const existing = get().items.find((item) => item.id === product.id);
        set({
          items: existing
            ? get().items.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: Math.min(99, item.quantity + 1) }
                  : item,
              )
            : [...get().items, { ...product, quantity: 1 }],
        });
      },
      increaseItem: (id) =>
        set({
          items: get().items.map((item) =>
            item.id === id ? { ...item, quantity: Math.min(99, item.quantity + 1) } : item,
          ),
        }),
      decreaseItem: (id) =>
        set({
          items: get().items.map((item) =>
            item.id === id ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item,
          ),
        }),
      removeItem: (id) => set({ items: get().items.filter((item) => item.id !== id) }),
      clearCart: () => set({ ...activeOrderDefaults }),
      holdOrder: () => {
        const state = get();
        if (state.items.length === 0) return;
        set({
          ...activeOrderDefaults,
          heldOrder: {
            items: state.items,
            orderType: state.orderType,
            notes: state.notes,
            discountType: state.discountType,
            discountValue: state.discountValue,
          },
        });
      },
      resumeOrder: () => {
        const heldOrder = get().heldOrder;
        if (!heldOrder) return;
        set({ ...heldOrder, paymentMethod: "CASH", amountReceived: 0, heldOrder: null });
      },
      setOrderType: (orderType) => set({ orderType }),
      setNotes: (notes) => set({ notes }),
      setDiscount: (discountType, discountValue) => set({ discountType, discountValue }),
      setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
      setAmountReceived: (amountReceived) => set({ amountReceived }),
      setHydrated: (hydrated) => set({ hydrated }),
    }),
    {
      name: "startek-pos-cart",
      partialize: (state) => ({
        items: state.items,
        orderType: state.orderType,
        notes: state.notes,
        discountType: state.discountType,
        discountValue: state.discountValue,
        paymentMethod: state.paymentMethod,
        amountReceived: state.amountReceived,
        heldOrder: state.heldOrder,
      }),
      onRehydrateStorage: () => (state) => state?.setHydrated(true),
    },
  ),
);
