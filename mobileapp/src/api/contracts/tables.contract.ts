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
  moveTable(input: MoveTableInput): Promise<void>;
  mergeTables(input: MergeTablesInput): Promise<void>;
  splitTable(input: SplitTableInput): Promise<void>;
}
