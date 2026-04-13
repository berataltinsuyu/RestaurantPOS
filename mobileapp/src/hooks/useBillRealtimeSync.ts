import { useIsFocused } from "@react-navigation/native";
import { useEffect, useRef } from "react";

import { services } from "../services/composition-root";
import { useAppStore } from "../state/app-store";

export function useBillRealtimeSync(tableId: string) {
  const isFocused = useIsFocused();
  const clearOrderByTableId = useAppStore((state) => state.clearOrderByTableId);
  const clearPaymentsForBill = useAppStore((state) => state.clearPaymentsForBill);
  const existingBillId = useAppStore(
    (state) => state.ordersByTableId[tableId]?.dbId ?? null,
  );
  const markRealtimeEvent = useAppStore((state) => state.markRealtimeEvent);
  const setConnectionState = useAppStore((state) => state.setConnectionState);
  const setPaymentsForBill = useAppStore((state) => state.setPaymentsForBill);
  const upsertOrder = useAppStore((state) => state.upsertOrder);
  const upsertTable = useAppStore((state) => state.upsertTable);
  const existingBillIdRef = useRef<number | null>(existingBillId);
  const callbacksRef = useRef({
    clearOrderByTableId,
    clearPaymentsForBill,
    markRealtimeEvent,
    setConnectionState,
    setPaymentsForBill,
    upsertOrder,
    upsertTable,
  });

  existingBillIdRef.current = existingBillId;
  callbacksRef.current = {
    clearOrderByTableId,
    clearPaymentsForBill,
    markRealtimeEvent,
    setConnectionState,
    setPaymentsForBill,
    upsertOrder,
    upsertTable,
  };

  useEffect(() => {
    if (!isFocused) {
      console.info("[useBillRealtimeSync] Skipping bill-scope subscription because screen is not focused.", {
        tableId,
      });
      return;
    }

    console.info("[useBillRealtimeSync] Creating bill-scope subscription.", {
      tableId,
    });

    const unsubscribe = services.realtimeSync.subscribeBillScope({
      onBillSnapshot: (bill) => {
        const {
          clearOrderByTableId: clearOrder,
          clearPaymentsForBill: clearPayments,
          upsertOrder: upsertBill,
        } = callbacksRef.current;

        if (!bill) {
          clearOrder(tableId);
          if (existingBillIdRef.current !== null) {
            clearPayments(existingBillIdRef.current);
          }
          return;
        }

        if (
          existingBillIdRef.current !== null &&
          existingBillIdRef.current !== bill.dbId
        ) {
          clearPayments(existingBillIdRef.current);
        }

        upsertBill(bill);
      },
      onConnectionStateChange: (nextState) => {
        callbacksRef.current.setConnectionState(nextState);
      },
      onPaymentsSnapshot: (billId, payments) => {
        const {
          clearPaymentsForBill: clearPayments,
          setPaymentsForBill: setPayments,
        } = callbacksRef.current;

        if (billId === null) {
          if (existingBillIdRef.current !== null) {
            clearPayments(existingBillIdRef.current);
          }
          return;
        }

        if (!payments.length) {
          clearPayments(billId);
          return;
        }

        setPayments(billId, payments);
      },
      onRealtimeEvent: () => {
        callbacksRef.current.markRealtimeEvent();
      },
      onTableSnapshot: (table) => {
        if (table) {
          callbacksRef.current.upsertTable(table);
        }
      },
      tableId,
    });

    return () => {
      console.info("[useBillRealtimeSync] Cleaning up bill-scope subscription.", {
        tableId,
      });
      unsubscribe();
    };
  }, [isFocused, tableId]);
}
