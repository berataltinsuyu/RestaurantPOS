import { BillItemRecord, BillRecord } from "../../types/domain";

export interface BillsReadGateway {
  readonly isConfigured: boolean;
  listBillsByIds(billIds: number[]): Promise<BillRecord[]>;
  getBillById(billId: number): Promise<BillRecord | null>;
  listBillItemsByBillId(billId: number): Promise<BillItemRecord[]>;
}
