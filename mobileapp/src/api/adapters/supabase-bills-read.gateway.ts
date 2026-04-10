import { BillsReadGateway } from "../contracts/bills-read.contract";
import { BillItemRecord, BillRecord } from "../../types/domain";
import { env } from "../../config/env";
import { getSupabaseClient, isSupabaseConfigured } from "../../services/supabase/client";
import {
  normalizeBillItemRecord,
  normalizeBillRecord,
} from "../mappers/supabase-record-normalizers";

const BILL_COLUMNS =
  "Id,BranchId,TableId,BillNo,WaiterId,Status,CustomerCount,Note,OpenedAt,ClosedAt,Subtotal,ManualDiscountAmount,DiscountAmount,ServiceChargeRate,ServiceCharge,VatAmount,TotalAmount,PaidAmount,RemainingAmount";
const BILL_ITEM_COLUMNS =
  "Id,BillId,ProductId,ProductNameSnapshot,UnitPrice,VatRate,Quantity,LineTotal,Note,Status";

export class SupabaseBillsReadGateway implements BillsReadGateway {
  public readonly isConfigured = isSupabaseConfigured();

  async listBillsByIds(billIds: number[]): Promise<BillRecord[]> {
    const client = getSupabaseClient();

    if (!client || !billIds.length) {
      return [];
    }

    let query = client
      .from("Bills")
      .select(BILL_COLUMNS)
      .in("Id", billIds);

    if (env.branchId !== undefined) {
      query = query.eq("BranchId", env.branchId);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return (data ?? []).map(normalizeBillRecord);
  }

  async getBillById(billId: number): Promise<BillRecord | null> {
    const client = getSupabaseClient();

    if (!client) {
      return null;
    }

    let query = client.from("Bills").select(BILL_COLUMNS).eq("Id", billId);

    if (env.branchId !== undefined) {
      query = query.eq("BranchId", env.branchId);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      throw error;
    }

    return data ? normalizeBillRecord(data) : null;
  }

  async listBillItemsByBillId(billId: number): Promise<BillItemRecord[]> {
    const client = getSupabaseClient();

    if (!client) {
      return [];
    }

    const { data, error } = await client
      .from("BillItems")
      .select(BILL_ITEM_COLUMNS)
      .eq("BillId", billId)
      .order("Id", { ascending: true });

    if (error) {
      throw error;
    }

    return (data ?? []).map(normalizeBillItemRecord);
  }
}
