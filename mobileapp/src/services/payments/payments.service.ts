import { PaymentsGateway } from "../../api/contracts/payments.contract";
import { PaymentsReadGateway } from "../../api/contracts/payments-read.contract";
import { groupSplitPayments } from "../../api/mappers/supabase-domain.mappers";
import {
  ConfirmCardPaymentInput,
  ConfirmCashPaymentInput,
  PaymentRecord,
  StartPaymentInput,
  StartSplitPaymentInput,
} from "../../types/domain";

export class PaymentsService {
  constructor(
    private readonly gateway: PaymentsGateway,
    private readonly readGateway?: PaymentsReadGateway,
  ) {}

  public get isReadConfigured() {
    return Boolean(this.readGateway?.isConfigured);
  }

  startPayment(input: StartPaymentInput) {
    return this.gateway.startPayment(input);
  }

  startSplitPayment(input: StartSplitPaymentInput) {
    return this.gateway.startSplitPayment(input);
  }

  confirmCardPayment(input: ConfirmCardPaymentInput) {
    return this.gateway.confirmCardPayment(input);
  }

  confirmCashPayment(input: ConfirmCashPaymentInput) {
    return this.gateway.confirmCashPayment(input);
  }

  async listPaymentsByBillId(billId: number): Promise<PaymentRecord[]> {
    if (!this.readGateway?.isConfigured) {
      return [];
    }

    return this.readGateway.listPaymentsByBillId(billId);
  }

  async listSplitPaymentGroupsByBillId(billId: number) {
    const payments = await this.listPaymentsByBillId(billId);
    return groupSplitPayments(payments);
  }
}
