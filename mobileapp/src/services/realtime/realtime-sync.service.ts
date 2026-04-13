import { env } from "../../config/env";
import { ConnectionState } from "../../types/app";
import { OrderDetail, PaymentRecord, TableSummary } from "../../types/domain";
import { BillsService } from "../bills/bills.service";
import { PaymentsService } from "../payments/payments.service";
import { RealtimeService } from "./realtime.service";
import { TablesService } from "../tables/tables.service";

interface RealtimeSyncCallbacks {
  onConnectionStateChange: (state: ConnectionState) => void;
  onRealtimeEvent: () => void;
}

interface TablesOverviewSyncCallbacks extends RealtimeSyncCallbacks {
  onTablesSnapshot: (tables: TableSummary[]) => void;
}

interface BillScopeSyncCallbacks extends RealtimeSyncCallbacks {
  tableId: string;
  onBillSnapshot: (bill: OrderDetail | null) => void;
  onPaymentsSnapshot: (billId: number | null, payments: PaymentRecord[]) => void;
  onTableSnapshot: (table: TableSummary | null) => void;
}

export class RealtimeSyncService {
  constructor(
    private readonly realtimeService: RealtimeService,
    private readonly tablesService: TablesService,
    private readonly billsService: BillsService,
    private readonly paymentsService: PaymentsService,
  ) {}

  start(callbacks: RealtimeSyncCallbacks) {
    const { onConnectionStateChange, onRealtimeEvent } = callbacks;

    if (!env.realtime.enabled || !this.realtimeService.isConfigured) {
      onConnectionStateChange("disabled");
      return () => undefined;
    }

    onConnectionStateChange("connecting");

    const unsubscribers = [
      this.realtimeService.subscribe("restaurantTables", onRealtimeEvent, {
        channelId: "bootstrap",
      }),
      this.realtimeService.subscribe("bills", onRealtimeEvent, {
        channelId: "bootstrap",
      }),
      this.realtimeService.subscribe("payments", onRealtimeEvent, {
        channelId: "bootstrap",
      }),
    ];

    onConnectionStateChange("ready");

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
      onConnectionStateChange("idle");
    };
  }

  subscribeTablesOverview(callbacks: TablesOverviewSyncCallbacks) {
    const { onConnectionStateChange, onRealtimeEvent, onTablesSnapshot } = callbacks;
    const realtimeActive = env.realtime.enabled && this.realtimeService.isConfigured;

    if (!this.tablesService.isReadConfigured) {
      console.warn("[RealtimeSyncService] Tables overview sync is disabled because live tables read is not configured.", {
        realtimeEnabled: env.realtime.enabled,
      });
      onConnectionStateChange("disabled");
      return () => undefined;
    }

    let active = true;

    const sync = async () => {
      try {
        const tables = await this.tablesService.listTables();

        if (!active) {
          return;
        }

        onTablesSnapshot(tables);
        onRealtimeEvent();
        onConnectionStateChange(realtimeActive ? "ready" : "disabled");
      } catch (error) {
        console.error("[RealtimeSyncService] Tables overview sync failed.", error);
        if (active) {
          onConnectionStateChange("error");
        }
      }
    };

    onConnectionStateChange("connecting");
    void sync();

    if (!realtimeActive) {
      return () => {
        active = false;
      };
    }

    const unsubscribers = [
      this.realtimeService.subscribe("restaurantTables", () => {
        void sync();
      }, {
        channelId: "tables-overview",
      }),
      this.realtimeService.subscribe("bills", () => {
        void sync();
      }, {
        channelId: "tables-overview",
      }),
      this.realtimeService.subscribe("payments", () => {
        void sync();
      }, {
        channelId: "tables-overview",
      }),
    ];

    return () => {
      active = false;
      unsubscribers.forEach((unsubscribe) => unsubscribe());
      onConnectionStateChange("idle");
    };
  }

  subscribeBillScope(callbacks: BillScopeSyncCallbacks) {
    const {
      onBillSnapshot,
      onConnectionStateChange,
      onPaymentsSnapshot,
      onRealtimeEvent,
      onTableSnapshot,
      tableId,
    } = callbacks;
    const realtimeActive = env.realtime.enabled && this.realtimeService.isConfigured;

    const numericTableId = Number(tableId);

    if (
      !this.tablesService.isReadConfigured ||
      !Number.isFinite(numericTableId)
    ) {
      console.warn("[RealtimeSyncService] Bill scope sync is disabled.", {
        numericTableId,
        realtimeEnabled: env.realtime.enabled,
        tablesReadConfigured: this.tablesService.isReadConfigured,
      });
      onConnectionStateChange("disabled");
      return () => undefined;
    }

    let active = true;

    const sync = async () => {
      try {
        const [table, tableRecord] = await Promise.all([
          this.tablesService.getTable(tableId),
          this.tablesService.getRestaurantTableById(numericTableId),
        ]);

        if (!active) {
          return;
        }

        onTableSnapshot(table);

        if (!tableRecord?.CurrentBillId) {
          onBillSnapshot(null);
          onPaymentsSnapshot(null, []);
          onRealtimeEvent();
          onConnectionStateChange(realtimeActive ? "ready" : "disabled");
          return;
        }

        const [bill, payments] = await Promise.all([
          this.billsService.getBillDetailById(tableRecord.CurrentBillId),
          this.paymentsService.listPaymentsByBillId(tableRecord.CurrentBillId),
        ]);

        if (!active) {
          return;
        }

        onBillSnapshot(bill);
        onPaymentsSnapshot(tableRecord.CurrentBillId, payments);
        onRealtimeEvent();
        onConnectionStateChange(realtimeActive ? "ready" : "disabled");
      } catch (error) {
        console.error("[RealtimeSyncService] Bill scope sync failed.", {
          tableId,
          error,
        });
        if (active) {
          onConnectionStateChange("error");
        }
      }
    };

    onConnectionStateChange("connecting");
    void sync();

    if (!realtimeActive) {
      return () => {
        active = false;
      };
    }

    const channelSuffix = `bill-scope-${numericTableId}`;
    const unsubscribers = [
      this.realtimeService.subscribe("restaurantTables", () => {
        void sync();
      }, {
        channelId: channelSuffix,
        filter: `Id=eq.${numericTableId}`,
      }),
      this.realtimeService.subscribe("bills", () => {
        void sync();
      }, {
        channelId: channelSuffix,
      }),
      this.realtimeService.subscribe("payments", () => {
        void sync();
      }, {
        channelId: channelSuffix,
      }),
    ];

    return () => {
      active = false;
      unsubscribers.forEach((unsubscribe) => unsubscribe());
      onConnectionStateChange("idle");
    };
  }
}
