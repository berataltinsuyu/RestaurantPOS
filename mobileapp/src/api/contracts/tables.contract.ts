import {
  MergeTablesInput,
  MoveTableInput,
  OpenTableInput,
  SplitTableInput,
  TableSummary,
} from "../../types/domain";

export interface TablesGateway {
  listTables(): Promise<TableSummary[]>;
  getTable(tableId: string): Promise<TableSummary | null>;
  openTable(input: OpenTableInput): Promise<TableSummary>;
  moveTable(input: MoveTableInput): Promise<TableSummary>;
  mergeTables(input: MergeTablesInput): Promise<TableSummary>;
  splitTable(input: SplitTableInput): Promise<TableSummary>;
}
