import { BillsReadGateway } from "../../api/contracts/bills-read.contract";
import { mapBillRecordToOrderDetail } from "../../api/mappers/supabase-domain.mappers";
import { OrderDetail } from "../../types/domain";

export class BillsService {
  constructor(private readonly gateway: BillsReadGateway) {}

  public get isReadConfigured() {
    return this.gateway.isConfigured;
  }

  listBillsByIds(billIds: number[]) {
    return this.gateway.listBillsByIds(billIds);
  }

  getBillById(billId: number) {
    return this.gateway.getBillById(billId);
  }

  listBillItemsByBillId(billId: number) {
    return this.gateway.listBillItemsByBillId(billId);
  }

  async getBillDetailById(billId: number): Promise<OrderDetail | null> {
    if (!this.isReadConfigured) {
      return null;
    }

    const [bill, items] = await Promise.all([
      this.gateway.getBillById(billId),
      this.gateway.listBillItemsByBillId(billId),
    ]);

    if (!bill) {
      return null;
    }

    return mapBillRecordToOrderDetail(bill, items);
  }
}
