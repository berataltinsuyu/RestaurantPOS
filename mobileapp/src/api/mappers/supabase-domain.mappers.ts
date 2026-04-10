import {
  BillItemRecord,
  BillRecord,
  OrderDetail,
  OrderLineItem,
  OrderStatus,
  PaymentMethod,
  PaymentRecord,
  PaymentStatusCode,
  RestaurantTableRecord,
  SplitPaymentGroup,
  TableStatus,
  TableSummary,
} from "../../types/domain";

export function mapRestaurantTableRecordToTableSummary(
  table: RestaurantTableRecord,
  activeBill?: BillRecord | null,
): TableSummary {
  return {
    activeOrderId:
      table.CurrentBillId !== null ? String(table.CurrentBillId) : undefined,
    areaLabel: table.AreaName,
    assignedWaiterName: undefined,
    guestCount: activeBill?.CustomerCount ?? table.CurrentGuestCount,
    id: String(table.Id),
    label: `Table ${table.TableNo}`,
    seats: table.Capacity,
    status: mapRestaurantTableStatusCode(table.Status),
    totalAmount: activeBill?.TotalAmount ?? 0,
    updatedAt: activeBill?.OpenedAt ?? table.CreatedAt,
  };
}

export function mapBillRecordToOrderDetail(
  bill: BillRecord,
  items: BillItemRecord[],
): OrderDetail {
  return {
    dbId: bill.Id,
    id: String(bill.Id),
    items: items.map(mapBillItemRecordToOrderLineItem),
    paidAmount: bill.PaidAmount,
    remainingAmount: bill.RemainingAmount,
    status: mapBillStatusCode(bill.Status),
    subtotal: Math.max(bill.Subtotal - bill.DiscountAmount, 0),
    tableId: String(bill.TableId),
    tax: bill.ServiceCharge,
    total: bill.TotalAmount,
    updatedAt: bill.ClosedAt ?? bill.OpenedAt,
  };
}

export function mapBillItemRecordToOrderLineItem(
  item: BillItemRecord,
): OrderLineItem {
  return {
    id: String(item.Id),
    name: item.ProductNameSnapshot,
    note: item.Note ?? undefined,
    productId: String(item.ProductId),
    quantity: item.Quantity,
    unitPrice: item.UnitPrice,
  };
}

export function mapRestaurantTableStatusCode(status: number): TableStatus {
  switch (status) {
    case 2:
      return "occupied";
    case 3:
      return "paymentPending";
    case 4:
      return "paid";
    case 1:
    default:
      return "empty";
  }
}

export function mapBillStatusCode(status: number): OrderStatus {
  switch (status) {
    case 2:
      return "paymentPending";
    case 3:
      return "paid";
    case 1:
    default:
      return "open";
  }
}

export function mapPaymentMethodFromRecord(
  payment: PaymentRecord,
): PaymentMethod {
  if (payment.SplitPaymentGroupId || payment.PaymentType === 3) {
    return "split";
  }

  return payment.PaymentType === 1 ? "cash" : "card";
}

export function groupSplitPayments(
  payments: PaymentRecord[],
): SplitPaymentGroup[] {
  const groupedPayments = new Map<string, PaymentRecord[]>();

  payments.forEach((payment) => {
    if (!payment.SplitPaymentGroupId) {
      return;
    }

    const existingGroup = groupedPayments.get(payment.SplitPaymentGroupId) ?? [];
    groupedPayments.set(payment.SplitPaymentGroupId, [
      ...existingGroup,
      payment,
    ]);
  });

  return Array.from(groupedPayments.entries()).map(([groupId, group]) => ({
    billId: group[0]?.BillId ?? 0,
    groupId,
    paymentIds: group.map((payment) => payment.Id),
    status: summarizePaymentStatus(group.map((payment) => payment.Status)),
    totalAmount: group.reduce((sum, payment) => sum + payment.Amount, 0),
  }));
}

function summarizePaymentStatus(statuses: PaymentStatusCode[]): PaymentStatusCode {
  if (statuses.some((status) => status === 4)) {
    return 4;
  }

  if (statuses.every((status) => status === 3)) {
    return 3;
  }

  if (statuses.some((status) => status === 2)) {
    return 2;
  }

  if (statuses.some((status) => status === 5)) {
    return 5;
  }

  return 1;
}
