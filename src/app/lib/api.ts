import type {
  AddBillItemRequestDto,
  AppSettingDto,
  BillItemDto,
  BillSummaryDto,
  BranchSummaryDto,
  CardPaymentRequestDto,
  CashPaymentRequestDto,
  ComplimentaryApprovalRequestDto,
  DashboardSummaryDto,
  DailyRevenueDto,
  FailedTransactionDto,
  LoginRequestDto,
  LoginResponseDto,
  PaymentDistributionDto,
  PaymentDto,
  PosTerminalDto,
  PrinterSettingDto,
  ProductCategoryDto,
  ProductDto,
  ProductQueryParamsDto,
  RefundPaymentRequestDto,
  RolePermissionMatrixDto,
  ShiftDto,
  SplitPaymentRequestDto,
  SplitPaymentResultDto,
  TablePerformanceDto,
  TableSummaryDto,
  TerminalPerformanceDto,
  TerminalTestConnectionDto,
  TransactionDetailDto,
  TransactionHistoryItemDto,
  UpdateBillItemRequestDto,
  UpdateRolePermissionsRequestDto,
  UpsertBranchRequest,
  UpsertProductRequestDto,
  UpsertPrinterSettingRequestDto,
  UserSummaryDto,
} from "../types/api";
import { apiRequest, buildQueryString } from "./http";

export const authApi = {
  login: (request: LoginRequestDto) =>
    apiRequest<LoginResponseDto>("/api/auth/login", {
      auth: false,
      method: "POST",
      body: request,
    }),
  me: () => apiRequest<LoginResponseDto>("/api/auth/me"),
};

export const tablesApi = {
  getByBranch: (branchId: number) =>
    apiRequest<TableSummaryDto[]>(`/api/tables/branch/${branchId}`),
  open: (tableId: number, payload: { waiterId: number; guestCount: number; note?: string }) =>
    apiRequest<TableSummaryDto>(`/api/tables/${tableId}/open`, {
      method: "POST",
      body: payload,
    }),
  move: (tableId: number, targetTableId: number) =>
    apiRequest<TableSummaryDto>(`/api/tables/${tableId}/move`, {
      method: "POST",
      body: { targetTableId },
    }),
  merge: (tableId: number, targetTableIds: number[], mergedName?: string) =>
    apiRequest<TableSummaryDto>(`/api/tables/${tableId}/merge`, {
      method: "POST",
      body: { targetTableIds, mergedName },
    }),
  split: (tableId: number, payload: { newTableNo: string; billItemIds: number[]; areaName?: string }) =>
    apiRequest<TableSummaryDto>(`/api/tables/${tableId}/split`, {
      method: "POST",
      body: payload,
    }),
  assignWaiter: (tableId: number, waiterId: number, reason?: string) =>
    apiRequest<TableSummaryDto>(`/api/tables/${tableId}/assign-waiter`, {
      method: "PUT",
      body: { waiterId, reason },
    }),
  addReservation: (
    tableId: number,
    payload: {
      customerName: string;
      phoneNumber: string;
      guestCount: number;
      reservationAt: string;
      notes?: string;
    },
  ) =>
    apiRequest<TableSummaryDto>(`/api/tables/${tableId}/reservation`, {
      method: "POST",
      body: payload,
    }),
};

export const billsApi = {
  getAll: () => apiRequest<BillSummaryDto[]>("/api/bills"),
  getByTable: (tableId: number) => apiRequest<BillSummaryDto | null>(`/api/bills/table/${tableId}`),
  getById: (billId: number) => apiRequest<BillSummaryDto>(`/api/bills/${billId}`),
  getItems: (billId: number) => apiRequest<BillItemDto[]>(`/api/bills/${billId}/items`),
  addItem: (billId: number, request: AddBillItemRequestDto) =>
    apiRequest<BillItemDto>(`/api/bills/${billId}/items`, {
      method: "POST",
      body: request,
    }),
  updateItem: (itemId: number, request: UpdateBillItemRequestDto) =>
    apiRequest<BillItemDto>(`/api/billitems/${itemId}`, {
      method: "PUT",
      body: request,
    }),
  deleteItem: (itemId: number) =>
    apiRequest<void>(`/api/billitems/${itemId}`, {
      method: "DELETE",
    }),
  close: (billId: number) =>
    apiRequest<BillSummaryDto>(`/api/bills/${billId}/close`, {
      method: "PUT",
    }),
  approveComplimentary: (billId: number, request: ComplimentaryApprovalRequestDto) =>
    apiRequest<BillSummaryDto>(`/api/bills/${billId}/complimentary-approval`, {
      method: "POST",
      body: request,
    }),
};

export const productsApi = {
  getCategories: () => apiRequest<ProductCategoryDto[]>("/api/categories"),
  getProducts: (params: ProductQueryParamsDto = {}) =>
    apiRequest<ProductDto[]>(`/api/products${buildQueryString({
      categoryId: params.categoryId,
      status: params.status && params.status !== "all" ? params.status : undefined,
      search: params.search,
      onlyMenuItems: params.onlyMenuItems ? true : undefined,
    })}`),
  getProductById: (productId: number) => apiRequest<ProductDto>(`/api/products/${productId}`),
  createProduct: (request: UpsertProductRequestDto) =>
    apiRequest<ProductDto>("/api/products", {
      method: "POST",
      body: request,
    }),
  updateProduct: (productId: number, request: UpsertProductRequestDto) =>
    apiRequest<ProductDto>(`/api/products/${productId}`, {
      method: "PUT",
      body: request,
    }),
  deactivateProduct: (productId: number) =>
    apiRequest<ProductDto>(`/api/products/${productId}/deactivate`, {
      method: "PUT",
    }),
  markOutOfStock: (productId: number) =>
    apiRequest<ProductDto>(`/api/products/${productId}/mark-out-of-stock`, {
      method: "PUT",
    }),
  reactivateProduct: (productId: number) =>
    apiRequest<ProductDto>(`/api/products/${productId}/reactivate`, {
      method: "PUT",
    }),
  removeFromMenu: (productId: number) =>
    apiRequest<void>(`/api/products/${productId}`, {
      method: "DELETE",
    }),
};

export const paymentsApi = {
  getAll: () => apiRequest<PaymentDto[]>("/api/payments"),
  getByBill: (billId: number) => apiRequest<PaymentDto[]>(`/api/payments/bill/${billId}`),
  cash: (request: CashPaymentRequestDto) =>
    apiRequest<PaymentDto>("/api/payments/cash", {
      method: "POST",
      body: request,
    }),
  card: (request: CardPaymentRequestDto) =>
    apiRequest<PaymentDto>("/api/payments/card", {
      method: "POST",
      body: request,
    }),
  split: (request: SplitPaymentRequestDto) =>
    apiRequest<SplitPaymentResultDto>("/api/payments/split", {
      method: "POST",
      body: request,
    }),
  refund: (request: RefundPaymentRequestDto) =>
    apiRequest<PaymentDto>("/api/payments/refund", {
      method: "POST",
      body: request,
    }),
  retry: (paymentId: number) =>
    apiRequest<PaymentDto>(`/api/payments/${paymentId}/retry`, {
      method: "POST",
    }),
  cancel: (paymentId: number) =>
    apiRequest<PaymentDto>(`/api/payments/${paymentId}/cancel`, {
      method: "POST",
    }),
};

export const transactionsApi = {
  history: () => apiRequest<TransactionHistoryItemDto[]>("/api/transactions/history"),
  detail: (transactionId: number) => apiRequest<TransactionDetailDto>(`/api/transactions/${transactionId}`),
};

export const reportsApi = {
  dashboardSummary: (branchId?: number) =>
    apiRequest<DashboardSummaryDto>(`/api/reports/dashboard-summary${buildQueryString({ branchId })}`),
  dailyRevenue: (branchId?: number) =>
    apiRequest<DailyRevenueDto[]>(`/api/reports/daily-revenue${buildQueryString({ branchId })}`),
  paymentDistribution: (branchId?: number) =>
    apiRequest<PaymentDistributionDto[]>(`/api/reports/payment-distribution${buildQueryString({ branchId })}`),
  tablePerformance: (branchId?: number) =>
    apiRequest<TablePerformanceDto[]>(`/api/reports/table-performance${buildQueryString({ branchId })}`),
  terminalPerformance: (branchId?: number) =>
    apiRequest<TerminalPerformanceDto[]>(`/api/reports/terminal-performance${buildQueryString({ branchId })}`),
  failedTransactions: (branchId?: number) =>
    apiRequest<FailedTransactionDto[]>(`/api/reports/failed-transactions${buildQueryString({ branchId })}`),
};

export const terminalsApi = {
  getByBranch: (branchId: number) => apiRequest<PosTerminalDto[]>(`/api/terminals/branch/${branchId}`),
  getById: (terminalId: number) => apiRequest<PosTerminalDto>(`/api/terminals/${terminalId}`),
  testConnection: (terminalId: number) =>
    apiRequest<TerminalTestConnectionDto>(`/api/terminals/${terminalId}/test-connection`, {
      method: "POST",
    }),
  setDefault: (terminalId: number) =>
    apiRequest<PosTerminalDto>(`/api/terminals/${terminalId}/set-default`, {
      method: "PUT",
    }),
};

export const settingsApi = {
  getBusiness: (branchId: number) => apiRequest<BranchSummaryDto>(`/api/settings/business/${branchId}`),
  updateBusiness: (branchId: number, request: UpsertBranchRequest) =>
    apiRequest<BranchSummaryDto>(`/api/settings/business/${branchId}`, {
      method: "PUT",
      body: request,
    }),
  getPrinters: (branchId?: number) =>
    apiRequest<PrinterSettingDto[]>(`/api/settings/printers${buildQueryString({ branchId })}`),
  createPrinter: (request: UpsertPrinterSettingRequestDto) =>
    apiRequest<PrinterSettingDto>("/api/settings/printers", {
      method: "POST",
      body: request,
    }),
  updatePrinter: (printerId: number, request: UpsertPrinterSettingRequestDto) =>
    apiRequest<PrinterSettingDto>(`/api/settings/printers/${printerId}`, {
      method: "PUT",
      body: request,
    }),
  getAppSettings: (branchId?: number) =>
    apiRequest<AppSettingDto[]>(`/api/settings/app-config${buildQueryString({ branchId })}`),
};

export const usersApi = {
  getAll: () => apiRequest<UserSummaryDto[]>("/api/users"),
};

export const rolePermissionsApi = {
  getAll: () => apiRequest<RolePermissionMatrixDto[]>("/api/rolepermissions"),
  update: (roleId: number, request: UpdateRolePermissionsRequestDto) =>
    apiRequest<RolePermissionMatrixDto>(`/api/rolepermissions/${roleId}`, {
      method: "PUT",
      body: request,
    }),
};

export const shiftsApi = {
  getAll: () => apiRequest<ShiftDto[]>("/api/shifts"),
  close: (shiftId: number, payload: { closingCashAmount: number; note?: string }) =>
    apiRequest<ShiftDto>(`/api/shifts/${shiftId}/close`, {
      method: "POST",
      body: payload,
    }),
};
