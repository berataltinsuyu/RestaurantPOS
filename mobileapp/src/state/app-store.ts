import { create } from "zustand";

import { ConnectionState } from "../types/app";
import {
  OrderDetail,
  PaymentIntent,
  PaymentIntentStatus,
  PaymentRecord,
  SplitPaymentEntry,
  TableSummary,
  WaiterSession,
} from "../types/domain";

interface AppStoreState {
  session: WaiterSession | null;
  connectionState: ConnectionState;
  lastSyncAt: string | null;
  selectedTableId: string | null;
  paymentIntent: PaymentIntent | null;
  paymentsByBillId: Record<number, PaymentRecord[]>;
  splitPaymentsByTableId: Record<string, SplitPaymentEntry[]>;
  tables: TableSummary[];
  appendSplitPayment: (tableId: string, entry: SplitPaymentEntry) => void;
  ordersByTableId: Record<string, OrderDetail>;
  clearSplitPayments: (tableId: string) => void;
  clearSession: () => void;
  clearPaymentIntent: () => void;
  clearPaymentsForBill: (billId: number) => void;
  clearOrderByTableId: (tableId: string) => void;
  markRealtimeEvent: () => void;
  setOrdersByTableId: (ordersByTableId: Record<string, OrderDetail>) => void;
  setPaymentsForBill: (billId: number, payments: PaymentRecord[]) => void;
  setSplitPayments: (tableId: string, entries: SplitPaymentEntry[]) => void;
  setConnectionState: (state: ConnectionState) => void;
  setPaymentIntent: (paymentIntent: PaymentIntent | null) => void;
  setSelectedTableId: (tableId: string | null) => void;
  setSession: (session: WaiterSession) => void;
  setTables: (tables: TableSummary[]) => void;
  updatePaymentIntentStatus: (status: PaymentIntentStatus) => void;
  upsertOrder: (order: OrderDetail) => void;
  upsertTable: (table: TableSummary) => void;
}

export const useAppStore = create<AppStoreState>((set) => ({
  appendSplitPayment: (tableId, entry) =>
    set((state) => ({
      splitPaymentsByTableId: {
        ...state.splitPaymentsByTableId,
        [tableId]: [
          ...(state.splitPaymentsByTableId[tableId] ?? []),
          entry,
        ],
      },
    })),
  clearSplitPayments: (tableId) =>
    set((state) => {
      const nextSplitPayments = { ...state.splitPaymentsByTableId };
      delete nextSplitPayments[tableId];

      return {
        splitPaymentsByTableId: nextSplitPayments,
      };
    }),
  clearPaymentsForBill: (billId) =>
    set((state) => {
      const nextPayments = { ...state.paymentsByBillId };
      delete nextPayments[billId];

      return {
        paymentsByBillId: nextPayments,
      };
    }),
  clearOrderByTableId: (tableId) =>
    set((state) => {
      const nextOrders = { ...state.ordersByTableId };
      delete nextOrders[tableId];

      return {
        ordersByTableId: nextOrders,
      };
    }),
  clearPaymentIntent: () => set({ paymentIntent: null }),
  clearSession: () => set({ session: null }),
  connectionState: "idle",
  lastSyncAt: null,
  markRealtimeEvent: () => set({ lastSyncAt: new Date().toISOString() }),
  ordersByTableId: {},
  paymentIntent: null,
  paymentsByBillId: {},
  selectedTableId: null,
  session: null,
  setOrdersByTableId: (ordersByTableId) => set({ ordersByTableId }),
  setPaymentsForBill: (billId, payments) =>
    set((state) => ({
      paymentsByBillId: {
        ...state.paymentsByBillId,
        [billId]: payments,
      },
    })),
  setSplitPayments: (tableId, entries) =>
    set((state) => ({
      splitPaymentsByTableId: {
        ...state.splitPaymentsByTableId,
        [tableId]: entries,
      },
    })),
  setConnectionState: (connectionState) => set({ connectionState }),
  setPaymentIntent: (paymentIntent) => set({ paymentIntent }),
  setSelectedTableId: (selectedTableId) => set({ selectedTableId }),
  setSession: (session) => set({ session }),
  setTables: (tables) => set({ tables }),
  splitPaymentsByTableId: {},
  tables: [],
  updatePaymentIntentStatus: (status) =>
    set((state) => ({
      paymentIntent: state.paymentIntent
        ? {
            ...state.paymentIntent,
            status,
          }
        : null,
    })),
  upsertOrder: (order) =>
    set((state) => ({
      ordersByTableId: {
        ...state.ordersByTableId,
        [order.tableId]: order,
      },
    })),
  upsertTable: (table) =>
    set((state) => {
      const existingIndex = state.tables.findIndex(
        (candidate) => candidate.id === table.id,
      );

      if (existingIndex === -1) {
        return {
          tables: [table, ...state.tables],
        };
      }

      const nextTables = [...state.tables];
      const existingTable = nextTables[existingIndex];

      if (!existingTable) {
        return {
          tables: [table, ...state.tables],
        };
      }

      nextTables[existingIndex] = {
        ...existingTable,
        ...table,
      };

      return {
        tables: nextTables,
      };
    }),
}));
