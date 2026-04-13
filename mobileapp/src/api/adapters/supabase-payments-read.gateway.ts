import { PaymentsReadGateway } from "../contracts/payments-read.contract";
import { PaymentRecord } from "../../types/domain";
import { getSupabaseClient, isSupabaseConfigured } from "../../services/supabase/client";
import { normalizePaymentRecord } from "../mappers/supabase-record-normalizers";

const PAYMENT_COLUMNS =
  "Id,BillId,TerminalId,PaymentType,Amount,Status,ReferenceNo,BankApprovalCode,CardMaskedPan,ErrorCode,ErrorMessage,CompletedAt,CreatedByUserId,OriginalPaymentId,SplitPaymentGroupId,Notes,RefundReason,CreatedAt";

export class SupabasePaymentsReadGateway implements PaymentsReadGateway {
  public get isConfigured() {
    return isSupabaseConfigured();
  }

  async listPaymentsByBillId(billId: number): Promise<PaymentRecord[]> {
    const client = getSupabaseClient();

    if (!client) {
      console.warn("[SupabasePaymentsReadGateway] Payments query skipped because Supabase client is unavailable.", {
        billId,
      });
      return [];
    }

    console.info("[SupabasePaymentsReadGateway] Querying Payments.", {
      billId,
    });

    const { data, error } = await client
      .from("Payments")
      .select(PAYMENT_COLUMNS)
      .eq("BillId", billId)
      .order("CreatedAt", { ascending: true });

    if (error) {
      console.error("[SupabasePaymentsReadGateway] Payments query failed.", {
        billId,
        code: error.code,
        details: error.details,
        hint: error.hint,
        message: error.message,
      });
      throw error;
    }

    console.info("[SupabasePaymentsReadGateway] Payments query completed.", {
      billId,
      rowCount: data?.length ?? 0,
    });

    return (data ?? []).map(normalizePaymentRecord);
  }
}
