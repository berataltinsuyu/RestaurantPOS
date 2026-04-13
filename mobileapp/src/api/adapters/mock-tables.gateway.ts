import { TablesGateway } from "../contracts/tables.contract";
import { mockTablesFixture } from "./mock-fixtures";
import {
  MergeTablesInput,
  MoveTableInput,
  OpenTableInput,
  SplitTableInput,
  TableSummary,
} from "../../types/domain";

export class MockTablesGateway implements TablesGateway {
  async listTables(): Promise<TableSummary[]> {
    return mockTablesFixture.map((table) => ({ ...table }));
  }

  async getTable(tableId: string): Promise<TableSummary | null> {
    const table = mockTablesFixture.find((candidate) => candidate.id === tableId);
    return table ? { ...table } : null;
  }

  async openTable(input: OpenTableInput): Promise<TableSummary> {
    const existingTable = mockTablesFixture.find(
      (candidate) => candidate.id === input.tableId,
    );
    const updatedTable: TableSummary = {
      activeOrderId: existingTable?.activeOrderId,
      areaLabel: existingTable?.areaLabel ?? "Salon",
      assignedWaiterName: "Mobil cihazdan atandı",
      guestCount: input.guestCount,
      id: input.tableId,
      label: existingTable?.label ?? `Masa ${input.tableId}`,
      seats: existingTable?.seats ?? 4,
      status: "occupied",
      totalAmount: existingTable?.totalAmount ?? 0,
      updatedAt: new Date().toISOString(),
    };

    const index = mockTablesFixture.findIndex(
      (candidate) => candidate.id === input.tableId,
    );

    if (index === -1) {
      mockTablesFixture.push(updatedTable);
    } else {
      mockTablesFixture[index] = updatedTable;
    }

    return { ...updatedTable };
  }

  async moveTable(input: MoveTableInput): Promise<TableSummary> {
    return (
      (await this.getTable(input.targetTableId)) ??
      (await this.openTable({
        guestCount: 2,
        tableId: input.targetTableId,
        waiterId: "0",
      }))
    );
  }

  async mergeTables(input: MergeTablesInput): Promise<TableSummary> {
    return (
      (await this.getTable(input.sourceTableId)) ??
      (await this.openTable({
        guestCount: 2,
        tableId: input.sourceTableId,
        waiterId: "0",
      }))
    );
  }

  async splitTable(input: SplitTableInput): Promise<TableSummary> {
    return this.openTable({
      guestCount: 2,
      tableId: input.targetTableId,
      waiterId: "0",
    });
  }
}
