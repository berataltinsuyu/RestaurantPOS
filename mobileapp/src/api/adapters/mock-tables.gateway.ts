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
      assignedWaiterName: "Assigned from mobile",
      guestCount: input.guestCount,
      id: input.tableId,
      label: existingTable?.label ?? `Table ${input.tableId}`,
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

  async moveTable(_input: MoveTableInput): Promise<void> {
    return;
  }

  async mergeTables(_input: MergeTablesInput): Promise<void> {
    return;
  }

  async splitTable(_input: SplitTableInput): Promise<void> {
    return;
  }
}
