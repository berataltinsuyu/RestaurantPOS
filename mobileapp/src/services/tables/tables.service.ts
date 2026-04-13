import { BillsReadGateway } from "../../api/contracts/bills-read.contract";
import { TablesGateway } from "../../api/contracts/tables.contract";
import { TablesReadGateway } from "../../api/contracts/tables-read.contract";
import { mapRestaurantTableRecordToTableSummary } from "../../api/mappers/supabase-domain.mappers";
import { RestaurantTableRecord } from "../../types/domain";
import {
  MergeTablesInput,
  MoveTableInput,
  OpenTableInput,
  SplitTableInput,
} from "../../types/domain";

export class TablesService {
  constructor(
    private readonly gateway: TablesGateway,
    private readonly readGateway?: TablesReadGateway,
    private readonly billsReadGateway?: BillsReadGateway,
  ) {}

  public get isReadConfigured() {
    return Boolean(this.readGateway?.isConfigured);
  }

  async listTables() {
    if (!this.readGateway?.isConfigured) {
      console.warn("[TablesService] Supabase tables read gateway is not configured.");
      return [];
    }

    const tableRows = await this.readGateway.listRestaurantTables();
    console.info("[TablesService] RestaurantTables snapshot received.", {
      rowCount: tableRows.length,
    });
    const currentBillIds = Array.from(
      new Set(
        tableRows
          .map((table) => table.CurrentBillId)
          .filter((billId): billId is number => billId !== null),
      ),
    );
    const billRows = currentBillIds.length && this.billsReadGateway
      ? await this.billsReadGateway.listBillsByIds(currentBillIds)
      : [];
    const billsById = new Map(billRows.map((bill) => [bill.Id, bill]));

    return tableRows.map((table) =>
      mapRestaurantTableRecordToTableSummary(
        table,
        table.CurrentBillId !== null
          ? billsById.get(table.CurrentBillId) ?? null
          : null,
      ),
    );
  }

  async getTable(tableId: string) {
    if (!this.readGateway?.isConfigured) {
      console.warn("[TablesService] Supabase table detail read gateway is not configured.", {
        tableId,
      });
      return null;
    }

    const tableNumericId = Number(tableId);

    if (!Number.isFinite(tableNumericId)) {
      return null;
    }

    const table = await this.readGateway.getRestaurantTableById(tableNumericId);

    if (!table) {
      return null;
    }

    const bill =
      table.CurrentBillId !== null && this.billsReadGateway
        ? await this.billsReadGateway.getBillById(table.CurrentBillId)
        : null;

    return mapRestaurantTableRecordToTableSummary(table, bill);
  }

  getRestaurantTableById(tableId: number): Promise<RestaurantTableRecord | null> {
    if (!this.readGateway?.isConfigured) {
      return Promise.resolve(null);
    }

    return this.readGateway.getRestaurantTableById(tableId);
  }

  openTable(input: OpenTableInput) {
    return this.gateway.openTable(input);
  }

  moveTable(input: MoveTableInput) {
    return this.gateway.moveTable(input);
  }

  mergeTables(input: MergeTablesInput) {
    return this.gateway.mergeTables(input);
  }

  splitTable(input: SplitTableInput) {
    return this.gateway.splitTable(input);
  }
}
