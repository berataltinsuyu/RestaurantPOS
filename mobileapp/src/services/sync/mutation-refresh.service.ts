import { useAppStore } from "../../state/app-store";
import { BillsService } from "../bills/bills.service";
import { PaymentsService } from "../payments/payments.service";
import { TablesService } from "../tables/tables.service";

export class MutationRefreshService {
  constructor(
    private readonly tablesService: TablesService,
    private readonly billsService: BillsService,
    private readonly paymentsService: PaymentsService,
  ) {}

  async refreshTablesOverview() {
    console.info("[MutationRefreshService] Tables overview refresh started.");
    const tables = await this.tablesService.listTables();
    const tablesWithInvalidAmounts = tables.filter(
      (table) => !Number.isFinite(table.totalAmount),
    );

    if (tablesWithInvalidAmounts.length) {
      console.warn("[MutationRefreshService] Tables overview refresh produced invalid table amounts.", {
        tables: tablesWithInvalidAmounts.map((table) => ({
          activeOrderId: table.activeOrderId ?? null,
          label: table.label,
          status: table.status,
          tableId: table.id,
          totalAmount: table.totalAmount,
        })),
      });
    }

    useAppStore.getState().setTables(tables);
    console.info("[MutationRefreshService] Tables overview refresh completed.", {
      rowCount: tables.length,
    });
    return tables;
  }

  async refreshBillScope(tableId: string) {
    const numericTableId = Number(tableId);

    if (!Number.isFinite(numericTableId)) {
      console.warn("[MutationRefreshService] Bill scope refresh skipped because table id is invalid.", {
        numericTableId,
        tableId,
      });
      return;
    }

    console.info("[MutationRefreshService] Bill scope refresh started.", {
      tableId,
    });

    const store = useAppStore.getState();
    const existingBillId = store.ordersByTableId[tableId]?.dbId ?? null;
    const [table, tableRecord] = await Promise.all([
      this.tablesService.getTable(tableId),
      this.tablesService.getRestaurantTableById(numericTableId),
    ]);

    if (!tableRecord) {
      store.clearOrderByTableId(tableId);
      if (existingBillId !== null) {
        store.clearPaymentsForBill(existingBillId);
      }
      console.info("[MutationRefreshService] Bill scope refresh completed with missing table record.", {
        tableId,
      });
      return;
    }

    if (table) {
      store.upsertTable(table);
    }

    if (!tableRecord?.CurrentBillId) {
      store.clearOrderByTableId(tableId);
      if (existingBillId !== null) {
        store.clearPaymentsForBill(existingBillId);
      }
      console.info("[MutationRefreshService] Bill scope refresh completed with no active bill.", {
        tableId,
      });
      return;
    }

    const [bill, payments] = await Promise.all([
      this.billsService.getBillDetailById(tableRecord.CurrentBillId),
      this.paymentsService.listPaymentsByBillId(tableRecord.CurrentBillId),
    ]);

    if (bill) {
      if (
        !Number.isFinite(bill.total) ||
        !Number.isFinite(bill.subtotal) ||
        !Number.isFinite(bill.paidAmount ?? 0) ||
        !Number.isFinite(bill.remainingAmount ?? 0)
      ) {
        console.warn("[MutationRefreshService] Bill scope refresh produced invalid numeric amounts.", {
          bill,
          tableId,
        });
      }

      store.upsertOrder(bill);
    } else {
      store.clearOrderByTableId(tableId);
    }

    if (payments.length) {
      store.setPaymentsForBill(tableRecord.CurrentBillId, payments);
    } else {
      store.clearPaymentsForBill(tableRecord.CurrentBillId);
    }

    console.info("[MutationRefreshService] Bill scope refresh completed.", {
      billId: tableRecord.CurrentBillId,
      paymentRowCount: payments.length,
      tableId,
    });
  }

  async refreshAfterMutation(tableIds: string | string[]) {
    const rawTableIds = Array.isArray(tableIds) ? tableIds : [tableIds];
    const normalizedTableIds = sanitizeTableIds(rawTableIds);

    console.info("[MutationRefreshService] Post-mutation refresh triggered.", {
      rawTableIds,
      tableIds: normalizedTableIds,
    });

    await this.refreshTablesOverview();
    if (!normalizedTableIds.length) {
      console.warn("[MutationRefreshService] Post-mutation bill-scope refresh skipped because no valid table ids remained after sanitization.", {
        rawTableIds,
      });
      return;
    }

    const refreshResults = await Promise.allSettled(
      normalizedTableIds.map((tableId) => this.refreshBillScope(tableId)),
    );

    console.info("[MutationRefreshService] Post-mutation refresh finished.", {
      refreshResults: refreshResults.map((result, index) => ({
        reason:
          result.status === "rejected"
            ? result.reason instanceof Error
              ? result.reason.message
              : String(result.reason)
            : null,
        status: result.status,
        tableId: normalizedTableIds[index] ?? null,
      })),
      tableIds: normalizedTableIds,
      updatedState: normalizedTableIds.map((tableId) => ({
        orderStatus:
          useAppStore.getState().ordersByTableId[tableId]?.status ?? null,
        tableId,
        tableStatus:
          useAppStore.getState().tables.find((table) => table.id === tableId)?.status ??
          null,
      })),
    });
  }
}

function sanitizeTableIds(tableIds: Array<string | null | undefined>) {
  const normalizedTableIds = Array.from(
    new Set(
      tableIds
        .map((tableId) => (typeof tableId === "string" ? tableId.trim() : ""))
        .filter(
          (tableId) =>
            tableId.length > 0 &&
            tableId !== "undefined" &&
            tableId !== "null" &&
            Number.isFinite(Number(tableId)),
        ),
    ),
  );

  const droppedTableIds = tableIds.filter((tableId) => {
    if (typeof tableId !== "string") {
      return true;
    }

    const normalized = tableId.trim();
    return (
      normalized.length === 0 ||
      normalized === "undefined" ||
      normalized === "null" ||
      !Number.isFinite(Number(normalized))
    );
  });

  console.info("[MutationRefreshService] Mutation refresh input sanitized.", {
    droppedTableIds,
    normalizedTableIds,
    rawTableIds: tableIds,
  });

  return normalizedTableIds;
}
