import { useEffect } from "react";

import { services } from "../services/composition-root";
import { useAppStore } from "../state/app-store";

export function useBillRealtimeSync(tableId: string) {
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

  useEffect(() => {
    return services.realtimeSync.subscribeBillScope({
      onBillSnapshot: (bill) => {
        if (!bill) {
          clearOrderByTableId(tableId);
          if (existingBillId !== null) {
            clearPaymentsForBill(existingBillId);
          }
          return;
        }

        upsertOrder(bill);
      },
      onConnectionStateChange: setConnectionState,
      onPaymentsSnapshot: (billId, payments) => {
        if (billId === null) {
          return;
        }

        if (!payments.length) {
          clearPaymentsForBill(billId);
          return;
        }

        setPaymentsForBill(billId, payments);
      },
      onRealtimeEvent: markRealtimeEvent,
      onTableSnapshot: (table) => {
        if (table) {
          upsertTable(table);
        }
      },
      tableId,
    });
  }, [
    clearOrderByTableId,
    clearPaymentsForBill,
    existingBillId,
    markRealtimeEvent,
    setConnectionState,
    setPaymentsForBill,
    tableId,
    upsertOrder,
    upsertTable,
  ]);
}
