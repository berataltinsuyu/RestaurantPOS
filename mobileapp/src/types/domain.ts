export type TableStatus =
  | "empty"
  | "occupied"
  | "paymentPending"
  | "paid";
export type RestaurantTableStatusCode = 1 | 2 | 3 | 4;
export type BillStatusCode = 1 | 2 | 3 | 4;
export type BillItemStatusCode = 1 | 2 | 3 | 4;
export type PaymentTypeCode = 1 | 2 | 3 | 4;
export type PaymentStatusCode = 1 | 2 | 3 | 4 | 5;

export type PaymentMethod = "card" | "cash" | "split";
export type OrderStatus = "open" | "paymentPending" | "paid";
export type PaymentIntentStatus =
  | "pending"
  | "redirectingToPos"
  | "awaitingContactless"
  | "completed"
  | "failed"
  | "cancelled";
export type SplitPaymentMethod = Exclude<PaymentMethod, "split">;
export type SplitPaymentSource = "amount" | "items";

export interface WaiterSession {
  waiterId: string;
  waiterName: string;
  shiftId: string;
  deviceLabel?: string;
}

export interface RestaurantTableRecord {
  Id: number;
  BranchId: number;
  TableNo: string;
  Capacity: number;
  Status: RestaurantTableStatusCode;
  WaiterId: number | null;
  CurrentBillId: number | null;
  IsMerged: boolean;
  AreaName: string;
  CurrentGuestCount: number;
  CreatedAt: string;
}

export interface BillRecord {
  Id: number;
  BranchId: number;
  TableId: number;
  BillNo: string;
  WaiterId: number;
  Status: BillStatusCode;
  CustomerCount: number;
  Note: string | null;
  OpenedAt: string;
  ClosedAt: string | null;
  Subtotal: number;
  ManualDiscountAmount: number;
  DiscountAmount: number;
  ServiceChargeRate: number;
  ServiceCharge: number;
  VatAmount: number;
  TotalAmount: number;
  PaidAmount: number;
  RemainingAmount: number;
}

export interface BillItemRecord {
  Id: number;
  BillId: number;
  ProductId: number;
  ProductNameSnapshot: string;
  UnitPrice: number;
  VatRate: number;
  Quantity: number;
  LineTotal: number;
  Note: string | null;
  Status: BillItemStatusCode;
}

export interface PaymentRecord {
  Id: number;
  BillId: number;
  TerminalId: number | null;
  PaymentType: PaymentTypeCode;
  Amount: number;
  Status: PaymentStatusCode;
  ReferenceNo: string;
  BankApprovalCode: string | null;
  CardMaskedPan: string | null;
  ErrorCode: string | null;
  ErrorMessage: string | null;
  CompletedAt: string | null;
  CreatedByUserId: number;
  OriginalPaymentId: number | null;
  SplitPaymentGroupId: string | null;
  Notes: string | null;
  RefundReason: string | null;
  CreatedAt: string;
}

export interface TableSummary {
  id: string;
  label: string;
  areaLabel?: string;
  seats: number;
  guestCount: number;
  status: TableStatus;
  totalAmount: number;
  updatedAt: string;
  activeOrderId?: string;
  assignedWaiterName?: string;
}

export interface OrderLineItem {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  note?: string;
}

export interface OrderDetail {
  id: string;
  dbId?: number;
  tableId: string;
  status: OrderStatus;
  items: OrderLineItem[];
  subtotal: number;
  tax: number;
  total: number;
  paidAmount?: number;
  remainingAmount?: number;
  updatedAt: string;
}

export interface MenuCategory {
  id: string;
  label: string;
  sortOrder: number;
}

export interface MenuProduct {
  id: string;
  categoryId: string;
  name: string;
  price: number;
  isAvailable: boolean;
}

export interface OpenTableInput {
  tableId: string;
  guestCount: number;
  waiterId: string;
}

export interface MoveTableInput {
  sourceTableId: string;
  targetTableId: string;
}

export interface MergeTablesInput {
  sourceTableId: string;
  targetTableId: string;
}

export interface SplitTableInput {
  sourceTableId: string;
  targetTableId: string;
  itemIds: string[];
}

export interface AddMenuProductInput {
  tableId: string;
  productId: string;
  quantity: number;
}

export interface UpdateOrderLineQuantityInput {
  tableId: string;
  orderLineId: string;
  quantity: number;
}

export interface StartPaymentInput {
  tableId: string;
  orderId: string;
  method: "card" | "cash";
  amount: number;
}

export interface StartSplitPaymentInput {
  tableId: string;
  orderId: string;
  splitCount: number;
  amountPerSplit: number;
}

export interface ConfirmCardPaymentInput {
  paymentIntentId: string;
}

export interface ConfirmCashPaymentInput {
  tableId: string;
  orderId: string;
  amount: number;
}

export interface PaymentIntent {
  id: string;
  orderId: string;
  tableId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentIntentStatus;
  createdAt: string;
}

export interface SplitPaymentEntry {
  id: string;
  method: SplitPaymentMethod;
  amount: number;
  source: SplitPaymentSource;
  itemIds: string[];
  isCommitted?: boolean;
}

export interface PaymentReceipt {
  receiptId: string;
  tableId: string;
  orderId: string;
  amount: number;
  method: PaymentMethod;
  paidAt: string;
}

export interface SplitPaymentGroup {
  groupId: string;
  paymentIds: number[];
  totalAmount: number;
  billId: number;
  status: PaymentStatusCode;
}
