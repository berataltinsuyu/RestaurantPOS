export interface LoginRequestDto {
  branchId?: number;
  branchCode?: string;
  userName: string;
  password: string;
}

export interface UserSummaryDto {
  id: number;
  fullName: string;
  userName: string;
  email: string;
  isActive: boolean;
  roleId: number;
  roleName: string;
  branchId?: number | null;
  branchName?: string | null;
  createdAt: string;
}

export interface BranchSummaryDto {
  id: number;
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
  taxNumber: string;
  merchantNumber: string;
  isActive: boolean;
  createdAt: string;
}

export interface UpsertBranchRequest {
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
  taxNumber: string;
  merchantNumber: string;
  isActive: boolean;
}

export interface LoginResponseDto {
  token: string;
  expiresAt: string;
  user: UserSummaryDto;
  branch: BranchSummaryDto;
  permissions: string[];
}

export interface ReservationInfoDto {
  id: number;
  customerName: string;
  phoneNumber: string;
  guestCount: number;
  reservationAt: string;
  notes?: string | null;
  status: "Aktif" | "Tamamlandi" | "Iptal";
}

export interface TableSummaryDto {
  id: number;
  branchId: number;
  tableNo: string;
  capacity: number;
  status: "Bos" | "Dolu" | "OdemeBekliyor" | "Odendi";
  waiterId?: number | null;
  waiterName?: string | null;
  currentBillId?: number | null;
  isMerged: boolean;
  areaName: string;
  currentGuestCount: number;
  createdAt: string;
  currentTotal: number;
  activeReservation?: ReservationInfoDto | null;
}

export interface ProductCategoryDto {
  id: number;
  name: string;
  isActive: boolean;
  productCount: number;
}

export type ProductMenuStatus = "Aktif" | "Pasif" | "Tukendi";

export interface ProductDto {
  id: number;
  categoryId: number;
  categoryName: string;
  name: string;
  description?: string | null;
  price: number;
  vatRate: number;
  isActive: boolean;
  isMenuActive: boolean;
  isOutOfStock: boolean;
  status: ProductMenuStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ProductQueryParamsDto {
  categoryId?: number;
  status?: ProductMenuStatus | "all";
  search?: string;
  onlyMenuItems?: boolean;
}

export interface UpsertProductRequestDto {
  categoryId: number;
  name: string;
  description?: string | null;
  price: number;
  vatRate: number;
  isActive: boolean;
  isMenuActive: boolean;
  isOutOfStock: boolean;
}

export interface BillItemDto {
  id: number;
  billId: number;
  productId: number;
  productNameSnapshot: string;
  unitPrice: number;
  vatRate: number;
  quantity: number;
  lineTotal: number;
  note?: string | null;
  status: "Hazirlaniyor" | "ServisEdildi" | "Iptal" | "Ikram";
}

export interface BillSummaryDto {
  id: number;
  branchId: number;
  tableId: number;
  tableNo: string;
  billNo: string;
  waiterId: number;
  waiterName: string;
  status: "Acik" | "OdemeBekliyor" | "Kapandi" | "Iptal";
  customerCount: number;
  note?: string | null;
  openedAt: string;
  closedAt?: string | null;
  subtotal: number;
  discountAmount: number;
  serviceCharge: number;
  vatAmount: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  items: BillItemDto[];
}

export interface AddBillItemRequestDto {
  productId: number;
  quantity: number;
  note?: string;
}

export interface UpdateBillItemRequestDto {
  quantity: number;
  note?: string;
}

export interface ComplimentaryApprovalRequestDto {
  billItemIds: number[];
  reason: string;
  approverName: string;
}

export interface PosTerminalDto {
  id: number;
  branchId: number;
  terminalNo: string;
  deviceName: string;
  cashRegisterName: string;
  status: "Bagli" | "Islemde" | "Cevrimdisi" | "Mesgul";
  lastConnectionAt?: string | null;
  lastSuccessfulTransactionAt?: string | null;
  isDefault: boolean;
  isActive: boolean;
  ipAddress?: string | null;
  model?: string | null;
  firmwareVersion?: string | null;
  successRate: number;
  totalTransactionsToday: number;
  totalAmountToday: number;
}

export interface TerminalTestConnectionDto {
  success: boolean;
  message: string;
  testedAt: string;
  status: "Bagli" | "Islemde" | "Cevrimdisi" | "Mesgul";
}

export interface PaymentDto {
  id: number;
  billId: number;
  billNo: string;
  terminalId?: number | null;
  terminalNo?: string | null;
  paymentType: "Nakit" | "Kart" | "BolunmusOdeme" | "Iade";
  amount: number;
  status: "Bekliyor" | "PosaGonderildi" | "Basarili" | "Basarisiz" | "IptalEdildi";
  referenceNo: string;
  bankApprovalCode?: string | null;
  cardMaskedPan?: string | null;
  errorCode?: string | null;
  errorMessage?: string | null;
  createdAt: string;
  completedAt?: string | null;
  createdByUserId: number;
  createdByUserName: string;
  originalPaymentId?: number | null;
  splitPaymentGroupId?: string | null;
}

export interface CashPaymentRequestDto {
  billId: number;
  amount: number;
}

export interface CardPaymentRequestDto {
  billId: number;
  terminalId: number;
  amount: number;
  cardMaskedPan?: string;
}

export interface SplitPaymentPartRequestDto {
  amount: number;
  method: "Nakit" | "Kart" | "BolunmusOdeme" | "Iade";
  terminalId?: number | null;
  cardMaskedPan?: string | null;
}

export interface SplitPaymentRequestDto {
  billId: number;
  mode: string;
  parts: SplitPaymentPartRequestDto[];
}

export interface SplitPaymentResultDto {
  groupId: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  payments: PaymentDto[];
}

export interface RefundPaymentRequestDto {
  originalPaymentId: number;
  amount: number;
  terminalId?: number | null;
  reason: string;
  description?: string | null;
  approverName?: string | null;
}

export interface TransactionHistoryItemDto {
  id: number;
  transactionDate: string;
  tableNo: string;
  billNo: string;
  terminalNo: string;
  transactionTypeLabel: string;
  paymentTypeLabel: string;
  amount: number;
  statusLabel: string;
  referenceNo?: string | null;
  originalPaymentId?: number | null;
  originalReferenceNo?: string | null;
  refundReason?: string | null;
}

export interface TransactionTimelineItemDto {
  label: string;
  timestamp: string;
  status: string;
  detail?: string | null;
}

export interface TransactionDetailDto {
  id: number;
  receiptNo: string;
  tableNo: string;
  waiter: string;
  terminalId: string;
  terminalName: string;
  transactionTypeLabel: string;
  paymentType: string;
  amount: number;
  bankReference?: string | null;
  originalReferenceNo?: string | null;
  originalPaymentId?: number | null;
  authCode?: string | null;
  cardLastFour?: string | null;
  transactionDate: string;
  status: string;
  errorReason?: string | null;
  notes?: string | null;
  refundReason?: string | null;
  items: BillItemDto[];
  timeline: TransactionTimelineItemDto[];
}

export interface DashboardSummaryDto {
  branchName: string;
  branchCode: string;
  activeTables: number;
  activeOrders: number;
  pendingPayments: number;
  totalRevenue: number;
  connectedTerminals: number;
  offlineTerminals: number;
}

export interface DailyRevenueDto {
  date: string;
  cardAmount: number;
  cashAmount: number;
  splitAmount: number;
  totalAmount: number;
}

export interface PaymentDistributionDto {
  paymentType: string;
  transactionCount: number;
  amount: number;
  percentage: number;
}

export interface TablePerformanceDto {
  tableId: number;
  tableNo: string;
  transactionCount: number;
  revenue: number;
}

export interface TerminalPerformanceDto {
  terminalId: number;
  terminalNo: string;
  deviceName: string;
  transactionCount: number;
  totalAmount: number;
  successRate: number;
  healthStatus: string;
}

export interface FailedTransactionDto {
  paymentId: number;
  billNo: string;
  tableNo: string;
  terminalNo?: string | null;
  amount: number;
  errorCode: string;
  errorMessage: string;
  createdAt: string;
}

export interface ShiftDto {
  id: number;
  branchId: number;
  branchName: string;
  userId: number;
  userName: string;
  openingCashAmount: number;
  closingCashAmount?: number | null;
  openedAt: string;
  closedAt?: string | null;
  status: "Acik" | "Kapandi";
  note?: string | null;
}

export interface PrinterSettingDto {
  id: number;
  branchId: number;
  printerName: string;
  ipAddress: string;
  autoPrintReceipt: boolean;
  printKitchenCopy: boolean;
  printLogo: boolean;
  isActive: boolean;
}

export interface UpsertPrinterSettingRequestDto {
  branchId: number;
  printerName: string;
  ipAddress: string;
  autoPrintReceipt: boolean;
  printKitchenCopy: boolean;
  printLogo: boolean;
  isActive: boolean;
}

export interface AppSettingDto {
  id: number;
  branchId: number;
  key: string;
  value: string;
  group: string;
  description?: string | null;
  isActive: boolean;
}

export interface PermissionToggleDto {
  permissionId: number;
  code:
    | "View"
    | "Edit"
    | "Discount"
    | "Refund"
    | "Cancel"
    | "Reports"
    | "Settings"
    | "Terminal"
    | "EndOfDay"
    | "MenuManagement";
  name: string;
  description: string;
  isCritical: boolean;
  isEnabled: boolean;
}

export interface RolePermissionMatrixDto {
  roleId: number;
  roleName: string;
  userCount: number;
  permissions: PermissionToggleDto[];
}

export interface UpdateRolePermissionsRequestDto {
  permissions: Array<{
    permissionId: number;
    isEnabled: boolean;
  }>;
}

export interface AppSession extends LoginResponseDto {}
