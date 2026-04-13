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
  public get isConfigured() {
    return isSupabaseConfigured();
  }

  async listBillsByIds(billIds: number[]): Promise<BillRecord[]> {
    const client = getSupabaseClient();

    if (!client || !billIds.length) {
      console.warn("[SupabaseBillsReadGateway] Bills list query skipped.", {
        billIds,
        branchFilter: env.branchId ?? null,
        clientAvailable: Boolean(client),
      });
      return [];
    }

    console.info("[SupabaseBillsReadGateway] Querying Bills by ids.", {
      billCount: billIds.length,
      branchFilter: env.branchId ?? null,
    });

    let query = client
      .from("Bills")
      .select(BILL_COLUMNS)
      .in("Id", billIds);

    if (env.branchId !== undefined) {
      query = query.eq("BranchId", env.branchId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[SupabaseBillsReadGateway] Bills list query failed.", {
        billCount: billIds.length,
        branchFilter: env.branchId ?? null,
        code: error.code,
        details: error.details,
        hint: error.hint,
        message: error.message,
      });
      throw error;
    }

    console.info("[SupabaseBillsReadGateway] Bills list query completed.", {
      billCount: billIds.length,
      branchFilter: env.branchId ?? null,
      rowCount: data?.length ?? 0,
    });

    return (data ?? []).map(normalizeBillRecord);
  }

  async getBillById(billId: number): Promise<BillRecord | null> {
    const client = getSupabaseClient();

    if (!client) {
      console.warn("[SupabaseBillsReadGateway] Bill detail query skipped because Supabase client is unavailable.", {
        billId,
        branchFilter: env.branchId ?? null,
      });
      return null;
    }

    let query = client.from("Bills").select(BILL_COLUMNS).eq("Id", billId);

    if (env.branchId !== undefined) {
      query = query.eq("BranchId", env.branchId);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      console.error("[SupabaseBillsReadGateway] Bill detail query failed.", {
        billId,
        branchFilter: env.branchId ?? null,
        code: error.code,
        details: error.details,
        hint: error.hint,
        message: error.message,
      });
      throw error;
    }

    return data ? normalizeBillRecord(data) : null;
  }

  async listBillItemsByBillId(billId: number): Promise<BillItemRecord[]> {
    const client = getSupabaseClient();

    if (!client) {
      console.warn("[SupabaseBillsReadGateway] BillItems query skipped because Supabase client is unavailable.", {
        billId,
      });
      return [];
    }

    console.info("[SupabaseBillsReadGateway] Querying BillItems.", {
      billId,
    });

    const { data, error } = await client
      .from("BillItems")
      .select(BILL_ITEM_COLUMNS)
      .eq("BillId", billId)
      .order("Id", { ascending: true });

    if (error) {
      console.error("[SupabaseBillsReadGateway] BillItems query failed.", {
        billId,
        code: error.code,
        details: error.details,
        hint: error.hint,
        message: error.message,
      });
      throw error;
    }

    console.info("[SupabaseBillsReadGateway] BillItems query completed.", {
      billId,
      rowCount: data?.length ?? 0,
    });

    return (data ?? []).map(normalizeBillItemRecord);
  }
}
