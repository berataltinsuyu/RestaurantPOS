import { PaymentRecord } from "../../types/domain";

export interface PaymentsReadGateway {
  readonly isConfigured: boolean;
  listPaymentsByBillId(billId: number): Promise<PaymentRecord[]>;
}
