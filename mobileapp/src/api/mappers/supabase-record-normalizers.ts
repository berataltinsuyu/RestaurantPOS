import {
  BillItemRecord,
  BillRecord,
  PaymentRecord,
  RestaurantTableRecord,
} from "../../types/domain";

function asNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function asNullableNumber(value: unknown) {
  if (value === null || value === undefined) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function asString(value: unknown) {
  return typeof value === "string" ? value : String(value ?? "");
}

function asNullableString(value: unknown) {
  return value === null || value === undefined ? null : String(value);
}

function asBoolean(value: unknown) {
  return Boolean(value);
}

export function normalizeRestaurantTableRecord(
  record: Partial<RestaurantTableRecord>,
): RestaurantTableRecord {
  return {
    AreaName: asString(record.AreaName),
    BranchId: asNumber(record.BranchId),
    Capacity: asNumber(record.Capacity),
    CreatedAt: asString(record.CreatedAt),
    CurrentBillId: asNullableNumber(record.CurrentBillId),
    CurrentGuestCount: asNumber(record.CurrentGuestCount),
    Id: asNumber(record.Id),
    IsMerged: asBoolean(record.IsMerged),
    Status: asNumber(record.Status) as RestaurantTableRecord["Status"],
    TableNo: asString(record.TableNo),
    WaiterId: asNullableNumber(record.WaiterId),
  };
}

export function normalizeBillRecord(record: Partial<BillRecord>): BillRecord {
  return {
    BillNo: asString(record.BillNo),
    BranchId: asNumber(record.BranchId),
    ClosedAt: asNullableString(record.ClosedAt),
    CustomerCount: asNumber(record.CustomerCount),
    DiscountAmount: asNumber(record.DiscountAmount),
    Id: asNumber(record.Id),
    ManualDiscountAmount: asNumber(record.ManualDiscountAmount),
    Note: asNullableString(record.Note),
    OpenedAt: asString(record.OpenedAt),
    PaidAmount: asNumber(record.PaidAmount),
    RemainingAmount: asNumber(record.RemainingAmount),
    ServiceCharge: asNumber(record.ServiceCharge),
    ServiceChargeRate: asNumber(record.ServiceChargeRate),
    Status: asNumber(record.Status) as BillRecord["Status"],
    Subtotal: asNumber(record.Subtotal),
    TableId: asNumber(record.TableId),
    TotalAmount: asNumber(record.TotalAmount),
    VatAmount: asNumber(record.VatAmount),
    WaiterId: asNumber(record.WaiterId),
  };
}

export function normalizeBillItemRecord(
  record: Partial<BillItemRecord>,
): BillItemRecord {
  return {
    BillId: asNumber(record.BillId),
    Id: asNumber(record.Id),
    LineTotal: asNumber(record.LineTotal),
    Note: asNullableString(record.Note),
    ProductId: asNumber(record.ProductId),
    ProductNameSnapshot: asString(record.ProductNameSnapshot),
    Quantity: asNumber(record.Quantity),
    Status: asNumber(record.Status) as BillItemRecord["Status"],
    UnitPrice: asNumber(record.UnitPrice),
    VatRate: asNumber(record.VatRate),
  };
}

export function normalizePaymentRecord(
  record: Partial<PaymentRecord>,
): PaymentRecord {
  return {
    Amount: asNumber(record.Amount),
    BankApprovalCode: asNullableString(record.BankApprovalCode),
    BillId: asNumber(record.BillId),
    CardMaskedPan: asNullableString(record.CardMaskedPan),
    CompletedAt: asNullableString(record.CompletedAt),
    CreatedAt: asString(record.CreatedAt),
    CreatedByUserId: asNumber(record.CreatedByUserId),
    ErrorCode: asNullableString(record.ErrorCode),
    ErrorMessage: asNullableString(record.ErrorMessage),
    Id: asNumber(record.Id),
    Notes: asNullableString(record.Notes),
    OriginalPaymentId: asNullableNumber(record.OriginalPaymentId),
    PaymentType: asNumber(record.PaymentType) as PaymentRecord["PaymentType"],
    ReferenceNo: asString(record.ReferenceNo),
    RefundReason: asNullableString(record.RefundReason),
    SplitPaymentGroupId: asNullableString(record.SplitPaymentGroupId),
    Status: asNumber(record.Status) as PaymentRecord["Status"],
    TerminalId: asNullableNumber(record.TerminalId),
  };
}
