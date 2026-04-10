import { PaymentsReadGateway } from "../contracts/payments-read.contract";
import { PaymentRecord } from "../../types/domain";
import { getSupabaseClient, isSupabaseConfigured } from "../../services/supabase/client";
import { normalizePaymentRecord } from "../mappers/supabase-record-normalizers";

const PAYMENT_COLUMNS =
  "Id,BillId,TerminalId,PaymentType,Amount,Status,ReferenceNo,BankApprovalCode,CardMaskedPan,ErrorCode,ErrorMessage,CompletedAt,CreatedByUserId,OriginalPaymentId,SplitPaymentGroupId,Notes,RefundReason,CreatedAt";

export class SupabasePaymentsReadGateway implements PaymentsReadGateway {
  public readonly isConfigured = isSupabaseConfigured();

  async listPaymentsByBillId(billId: number): Promise<PaymentRecord[]> {
    const client = getSupabaseClient();

    if (!client) {
      return [];
    }

    const { data, error } = await client
      .from("Payments")
      .select(PAYMENT_COLUMNS)
      .eq("BillId", billId)
      .order("CreatedAt", { ascending: true });

    if (error) {
      throw error;
    }

    return (data ?? []).map(normalizePaymentRecord);
  }
}
