import { PaymentsGateway } from "../contracts/payments.contract";
import {
  ConfirmCardPaymentInput,
  ConfirmCashPaymentInput,
  PaymentIntent,
  PaymentReceipt,
  StartPaymentInput,
  StartSplitPaymentInput,
} from "../../types/domain";

const paymentIntentFixture = new Map<string, PaymentIntent>();

export class MockPaymentsGateway implements PaymentsGateway {
  async startPayment(input: StartPaymentInput): Promise<PaymentIntent> {
    const intent: PaymentIntent = {
      amount: input.amount,
      createdAt: new Date().toISOString(),
      id: `payment-intent-${Date.now()}`,
      method: input.method,
      orderId: input.orderId,
      status:
        input.method === "card" ? "redirectingToPos" : "completed",
      tableId: input.tableId,
    };

    paymentIntentFixture.set(intent.id, intent);
    return intent;
  }

  async startSplitPayment(
    input: StartSplitPaymentInput,
  ): Promise<PaymentIntent> {
    const intent: PaymentIntent = {
      amount: input.amountPerSplit,
      createdAt: new Date().toISOString(),
      id: `split-payment-intent-${Date.now()}`,
      method: "split",
      orderId: input.orderId,
      status: "redirectingToPos",
      tableId: input.tableId,
    };

    paymentIntentFixture.set(intent.id, intent);
    return intent;
  }

  async confirmCardPayment(
    input: ConfirmCardPaymentInput,
  ): Promise<PaymentReceipt> {
    const intent = paymentIntentFixture.get(input.paymentIntentId);
    paymentIntentFixture.delete(input.paymentIntentId);

    return {
      amount: intent?.amount ?? 0,
      method: intent?.method ?? "card",
      orderId: intent?.orderId ?? `order-for-${input.paymentIntentId}`,
      paidAt: new Date().toISOString(),
      receiptId: `receipt-${Date.now()}`,
      tableId: intent?.tableId ?? "table-from-card-flow",
    };
  }

  async confirmCashPayment(
    input: ConfirmCashPaymentInput,
  ): Promise<PaymentReceipt> {
    return {
      amount: input.amount,
      method: "cash",
      orderId: input.orderId,
      paidAt: new Date().toISOString(),
      receiptId: `receipt-${Date.now()}`,
      tableId: input.tableId,
    };
  }
}
