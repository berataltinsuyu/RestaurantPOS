import { PaymentsGateway } from "../contracts/payments.contract";
import { MobileApiClient } from "../http/api-client";
import { env } from "../../config/env";
import {
  ConfirmCardPaymentInput,
  ConfirmCashPaymentInput,
  PaymentIntent,
  PaymentReceipt,
  SplitPaymentEntry,
  StartPaymentInput,
  StartSplitPaymentInput,
} from "../../types/domain";

interface BackendPaymentDto {
  Id: number;
  BillId: number;
  Amount: number;
  ReferenceNo: string;
  CreatedAt: string;
  CompletedAt?: string | null;
  ErrorMessage?: string | null;
  Status?: number | string;
}

interface BackendSplitPaymentResultDto {
  GroupId: string;
  PaidAmount: number;
  Payments?: BackendPaymentDto[];
  RemainingAmount?: number;
  TotalAmount?: number;
}

interface BackendTerminalDto {
  Id: number;
  BranchId: number;
  IsActive: boolean;
  IsDefault: boolean;
}

const paymentIntentFixture = new Map<string, PaymentIntent>();

function parseBillId(orderId: string) {
  const billId = Number(orderId);

  if (!Number.isFinite(billId)) {
    throw new Error(`Invalid order/bill id: ${orderId}`);
  }

  return billId;
}

function toPaymentReceipt(
  payment: BackendPaymentDto,
  method: PaymentReceipt["method"],
): PaymentReceipt {
  return {
    amount: payment.Amount,
    method,
    orderId: String(payment.BillId),
    paidAt: payment.CompletedAt ?? payment.CreatedAt,
    receiptId: payment.ReferenceNo || String(payment.Id),
    tableId: "",
  };
}

function isSuccessfulPaymentStatus(status: BackendPaymentDto["Status"]) {
  if (typeof status === "number") {
    return status === 3;
  }

  if (typeof status === "string") {
    return status === "Basarili";
  }

  return true;
}

function assertPaymentSucceeded(payment: BackendPaymentDto, context: string) {
  if (isSuccessfulPaymentStatus(payment.Status)) {
    return;
  }

  const detail =
    payment.ErrorMessage?.trim() ||
    `${context} backend üzerinde başarısız duruma geçti.`;

  throw new Error(detail);
}

function assertSplitPaymentSucceeded(result: BackendSplitPaymentResultDto) {
  const failedPayment = result.Payments?.find(
    (payment) => !isSuccessfulPaymentStatus(payment.Status),
  );

  if (failedPayment) {
    throw new Error(
      failedPayment.ErrorMessage?.trim() ||
        "Bölünmüş ödeme backend üzerinde başarısız duruma geçti.",
    );
  }

  if ((result.RemainingAmount ?? 0) > 0.01) {
    throw new Error("Bölünmüş ödeme tamamlanamadı; adisyonda kalan tutar var.");
  }
}

function mapSplitEntriesToBackendParts(entries: SplitPaymentEntry[], terminalId: number) {
  return entries.map((entry) => ({
    Amount: entry.amount,
    Method: entry.method === "cash" ? 1 : 2,
    TerminalId: entry.method === "card" ? terminalId : null,
  }));
}

export class BackendPaymentsGateway implements PaymentsGateway {
  constructor(private readonly apiClient: MobileApiClient) {}

  async startPayment(input: StartPaymentInput): Promise<PaymentIntent> {
    const intent: PaymentIntent = {
      amount: input.amount,
      billId: parseBillId(input.orderId),
      createdAt: new Date().toISOString(),
      id: `payment-intent-${Date.now()}`,
      method: input.method,
      orderId: input.orderId,
      status: input.method === "card" ? "redirectingToPos" : "completed",
      tableId: input.tableId,
    };

    paymentIntentFixture.set(intent.id, intent);
    console.info("[BackendPaymentsGateway] Payment intent staged.", {
      billId: intent.billId,
      method: input.method,
      paymentIntentId: intent.id,
      tableId: input.tableId,
    });

    return intent;
  }

  async startSplitPayment(
    input: StartSplitPaymentInput,
  ): Promise<PaymentIntent> {
    const intent: PaymentIntent = {
      amount: input.amountPerSplit,
      billId: parseBillId(input.orderId),
      createdAt: new Date().toISOString(),
      id: `split-payment-intent-${Date.now()}`,
      method: "split",
      orderId: input.orderId,
      splitEntries: input.entries ?? [],
      status: "redirectingToPos",
      tableId: input.tableId,
    };

    paymentIntentFixture.set(intent.id, intent);
    console.info("[BackendPaymentsGateway] Split payment intent staged.", {
      billId: intent.billId,
      entryCount: intent.splitEntries?.length ?? 0,
      paymentIntentId: intent.id,
      tableId: input.tableId,
    });

    return intent;
  }

  async confirmCardPayment(
    input: ConfirmCardPaymentInput,
  ): Promise<PaymentReceipt> {
    const intent = paymentIntentFixture.get(input.paymentIntentId);

    if (!intent?.billId) {
      throw new Error("Payment intent could not be resolved for card confirmation.");
    }

    console.info("[BackendPaymentsGateway] Confirm card payment started.", {
      billId: intent.billId,
      method: intent.method,
      paymentIntentId: input.paymentIntentId,
      tableId: intent.tableId,
    });

    const terminalId = await this.resolveDefaultTerminalId();

    if (intent.method === "split") {
      const splitEntries = intent.splitEntries ?? [];

      const payload = {
        BillId: intent.billId,
        Mode: "manual",
        Parts: mapSplitEntriesToBackendParts(splitEntries, terminalId),
      };

      console.info("[BackendPaymentsGateway] Split payment endpoint called.", {
        endpoint: "/api/payments/split",
        payload,
      });

      const response = await this.apiClient.request<BackendSplitPaymentResultDto>({
        body: JSON.stringify(payload),
        debugBody: payload,
        method: "POST",
        path: "/api/payments/split",
      });
      assertSplitPaymentSucceeded(response);

      paymentIntentFixture.delete(input.paymentIntentId);
      console.info("[BackendPaymentsGateway] Split payment completed.", {
        groupId: response.GroupId,
        paidAmount: response.PaidAmount,
        paymentCount: response.Payments?.length ?? 0,
        remainingAmount: response.RemainingAmount ?? null,
      });

      return {
        amount: response.PaidAmount,
        method: "split",
        orderId: intent.orderId,
        paidAt: new Date().toISOString(),
        receiptId: response.GroupId,
        tableId: intent.tableId,
      };
    }

    const payload = {
      Amount: intent.amount,
      BillId: intent.billId,
      TerminalId: terminalId,
    };

    console.info("[BackendPaymentsGateway] Card payment endpoint called.", {
      endpoint: "/api/payments/card",
      payload,
    });

    const response = await this.apiClient.request<BackendPaymentDto>({
      body: JSON.stringify(payload),
      debugBody: payload,
      method: "POST",
      path: "/api/payments/card",
    });
    assertPaymentSucceeded(response, "Kart ödemesi");

    paymentIntentFixture.delete(input.paymentIntentId);
    console.info("[BackendPaymentsGateway] Card payment completed.", {
      paymentStatus: response.Status ?? null,
      paymentId: response.Id,
      referenceNo: response.ReferenceNo,
    });

    return {
      ...toPaymentReceipt(response, "card"),
      tableId: intent.tableId,
    };
  }

  async confirmCashPayment(
    input: ConfirmCashPaymentInput,
  ): Promise<PaymentReceipt> {
    const billId = parseBillId(input.orderId);
    const payload = {
      Amount: input.amount,
      BillId: billId,
    };

    console.info("[BackendPaymentsGateway] Cash payment started.", {
      endpoint: "/api/payments/cash",
      payload,
      tableId: input.tableId,
    });

    const response = await this.apiClient.request<BackendPaymentDto>({
      body: JSON.stringify(payload),
      debugBody: payload,
      method: "POST",
      path: "/api/payments/cash",
    });
    assertPaymentSucceeded(response, "Nakit ödemesi");

    console.info("[BackendPaymentsGateway] Cash payment completed.", {
      paymentStatus: response.Status ?? null,
      paymentId: response.Id,
      referenceNo: response.ReferenceNo,
    });

    return {
      ...toPaymentReceipt(response, "cash"),
      tableId: input.tableId,
    };
  }

  private async resolveDefaultTerminalId() {
    const branchId = env.branchId;
    const path =
      branchId !== undefined ? `/api/terminals/branch/${branchId}` : "/api/terminals";

    console.info("[BackendPaymentsGateway] Resolving terminal.", {
      branchId: branchId ?? null,
      endpoint: path,
    });

    const terminals = await this.apiClient.request<BackendTerminalDto[]>({
      method: "GET",
      path,
    });

    const terminal =
      terminals.find((candidate) => candidate.IsActive && candidate.IsDefault) ??
      terminals.find((candidate) => candidate.IsActive) ??
      terminals[0];

    if (!terminal) {
      throw new Error("No POS terminal is available for card payment.");
    }

    console.info("[BackendPaymentsGateway] Terminal resolved.", {
      terminalId: terminal.Id,
    });

    return terminal.Id;
  }
}
