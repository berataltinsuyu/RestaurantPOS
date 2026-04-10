import {
  ConfirmCardPaymentInput,
  ConfirmCashPaymentInput,
  PaymentIntent,
  PaymentReceipt,
  StartPaymentInput,
  StartSplitPaymentInput,
} from "../../types/domain";

export interface PaymentsGateway {
  startPayment(input: StartPaymentInput): Promise<PaymentIntent>;
  startSplitPayment(input: StartSplitPaymentInput): Promise<PaymentIntent>;
  confirmCardPayment(
    input: ConfirmCardPaymentInput,
  ): Promise<PaymentReceipt>;
  confirmCashPayment(
    input: ConfirmCashPaymentInput,
  ): Promise<PaymentReceipt>;
}
