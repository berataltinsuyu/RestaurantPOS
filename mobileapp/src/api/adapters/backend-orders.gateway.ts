import { OrdersGateway } from "../contracts/orders.contract";
import { MobileApiClient } from "../http/api-client";
import {
  AddMenuProductInput,
  MenuProduct,
  OrderDetail,
  UpdateOrderLineQuantityInput,
} from "../../types/domain";

interface MenuCatalogLike {
  listMenuProducts(): Promise<MenuProduct[]>;
}

interface BackendBillItemDto {
  Id: number;
  BillId: number;
  ProductId: number;
  ProductNameSnapshot: string;
  UnitPrice: number;
  VatRate: number;
  Quantity: number;
  LineTotal: number;
  Note?: string | null;
  Status?: number | string;
}

interface BackendBillSummaryDto {
  Id: number;
  BranchId: number;
  TableId: number;
  TableNo: string;
  BillNo: string;
  WaiterId: number;
  WaiterName: string;
  Status: number | string;
  CustomerCount: number;
  Note?: string | null;
  OpenedAt: string;
  ClosedAt?: string | null;
  Subtotal: number;
  DiscountAmount: number;
  ServiceCharge: number;
  VatAmount: number;
  TotalAmount: number;
  PaidAmount: number;
  RemainingAmount: number;
  Items?: BackendBillItemDto[];
}

function toFiniteNumber(
  value: unknown,
  field: string,
  context: Record<string, unknown>,
  fallback = 0,
) {
  const numericValue = Number(value);

  if (Number.isFinite(numericValue)) {
    return numericValue;
  }

  console.warn("[BackendOrdersGateway] Invalid numeric field received. Falling back to 0.", {
    ...context,
    fallback,
    field,
    rawValue: value,
  });

  return fallback;
}

function parseNumericId(value: number | string, label: string) {
  const numericId = Number(value);

  if (!Number.isFinite(numericId)) {
    throw new Error(`Invalid ${label} id: ${value}`);
  }

  return numericId;
}

function mapBackendBillStatus(status: number | string): OrderDetail["status"] {
  if (typeof status === "number") {
    switch (status) {
      case 2:
        return "paymentPending";
      case 3:
      case 4:
        return "paid";
      case 1:
      default:
        return "open";
    }
  }

  switch (status) {
    case "OdemeBekliyor":
      return "paymentPending";
    case "Kapandi":
    case "Iptal":
      return "paid";
    case "Acik":
    default:
      return "open";
  }
}

function mapBackendBillSummaryToOrderDetail(
  bill: BackendBillSummaryDto,
): OrderDetail {
  const numericContext = {
    billId: bill.Id ?? null,
    tableId: bill.TableId ?? null,
  };

  return {
    dbId: toFiniteNumber(bill.Id, "Id", numericContext),
    id: String(bill.Id),
    items: (bill.Items ?? []).map((item) => ({
      id: String(item.Id),
      name: item.ProductNameSnapshot,
      note: item.Note ?? undefined,
      productId: String(item.ProductId),
      quantity: toFiniteNumber(item.Quantity, "Item.Quantity", {
        ...numericContext,
        itemId: item.Id ?? null,
        productId: item.ProductId ?? null,
      }),
      unitPrice: toFiniteNumber(item.UnitPrice, "Item.UnitPrice", {
        ...numericContext,
        itemId: item.Id ?? null,
        productId: item.ProductId ?? null,
      }),
    })),
    paidAmount: toFiniteNumber(
      bill.PaidAmount,
      "PaidAmount",
      numericContext,
    ),
    remainingAmount: toFiniteNumber(
      bill.RemainingAmount,
      "RemainingAmount",
      numericContext,
    ),
    status: mapBackendBillStatus(bill.Status),
    subtotal: Math.max(
      toFiniteNumber(bill.Subtotal, "Subtotal", numericContext) -
        toFiniteNumber(
          bill.DiscountAmount,
          "DiscountAmount",
          numericContext,
        ),
      0,
    ),
    tableId: String(bill.TableId),
    tax: toFiniteNumber(bill.ServiceCharge, "ServiceCharge", numericContext),
    total: toFiniteNumber(bill.TotalAmount, "TotalAmount", numericContext),
    updatedAt: bill.ClosedAt ?? bill.OpenedAt,
  };
}

export class BackendOrdersGateway implements OrdersGateway {
  constructor(
    private readonly apiClient: MobileApiClient,
    private readonly menuCatalog: MenuCatalogLike,
  ) {}

  async getOrderByTableId(tableId: string): Promise<OrderDetail | null> {
    const numericTableId = parseNumericId(tableId, "table");
    const endpointPath = `/api/bills/table/${numericTableId}`;

    console.info("[BackendOrdersGateway] Active bill fetch started.", {
      endpointPath,
      selectedTableId: tableId,
    });

    const response = await this.apiClient.request<BackendBillSummaryDto | null>({
      debugResponseBody: true,
      method: "GET",
      path: endpointPath,
    });

    console.info("[BackendOrdersGateway] Active bill fetch completed.", {
      selectedBillId: response?.Id ?? null,
      selectedTableId: tableId,
    });

    return response ? mapBackendBillSummaryToOrderDetail(response) : null;
  }

  async listMenuProducts(): Promise<MenuProduct[]> {
    return this.menuCatalog.listMenuProducts();
  }

  async addMenuProduct(input: AddMenuProductInput): Promise<OrderDetail> {
    const numericTableId = parseNumericId(input.tableId, "table");
    const numericProductId = parseNumericId(input.productId, "product");
    const selectedBillId =
      typeof input.billId === "number" && Number.isFinite(input.billId)
        ? input.billId
        : await this.resolveActiveBillId(input.tableId);
    const requestPayload = {
      Note: null,
      ProductId: numericProductId,
      Quantity: input.quantity,
    };
    const endpointPath = `/api/bills/${selectedBillId}/items`;

    console.info("[BackendOrdersGateway] Add menu product started.", {
      endpointPath,
      requestPayload,
      selectedBillId,
      selectedProductId: input.productId,
      selectedTableId: input.tableId,
    });

    await this.apiClient.request<BackendBillItemDto>({
      body: JSON.stringify(requestPayload),
      debugBody: requestPayload,
      debugResponseBody: true,
      method: "POST",
      path: endpointPath,
    });

    const refreshedBill = await this.fetchBillById(selectedBillId);

    console.info("[BackendOrdersGateway] Add menu product completed.", {
      itemCount: refreshedBill.items.length,
      selectedBillId,
      selectedProductId: input.productId,
      selectedTableId: input.tableId,
      totalAmount: refreshedBill.total,
    });

    if (refreshedBill.tableId !== String(numericTableId)) {
      console.warn("[BackendOrdersGateway] Refreshed bill table id does not match the selected table id.", {
        refreshedBillTableId: refreshedBill.tableId,
        selectedBillId,
        selectedTableId: input.tableId,
      });
    }

    return refreshedBill;
  }

  async updateOrderLineQuantity(
    input: UpdateOrderLineQuantityInput,
  ): Promise<OrderDetail> {
    const numericOrderLineId = parseNumericId(input.orderLineId, "bill item");
    const endpointPath = `/api/billitems/${numericOrderLineId}`;
    const requestPayload = {
      Note: null,
      Quantity: input.quantity,
    };

    console.info("[BackendOrdersGateway] Update order line quantity started.", {
      endpointPath,
      requestPayload,
      selectedOrderLineId: input.orderLineId,
      selectedTableId: input.tableId,
    });

    await this.apiClient.request<BackendBillItemDto>({
      body: JSON.stringify(requestPayload),
      debugBody: requestPayload,
      debugResponseBody: true,
      method: "PUT",
      path: endpointPath,
    });

    const refreshedOrder = await this.getOrderByTableId(input.tableId);

    if (!refreshedOrder) {
      throw new Error("Sipariş satırı güncellendi ancak güncel adisyon okunamadı.");
    }

    console.info("[BackendOrdersGateway] Update order line quantity completed.", {
      itemCount: refreshedOrder.items.length,
      selectedOrderLineId: input.orderLineId,
      selectedTableId: input.tableId,
    });

    return refreshedOrder;
  }

  private async resolveActiveBillId(tableId: string) {
    const activeBill = await this.getOrderByTableId(tableId);

    if (!activeBill?.dbId) {
      console.error("[BackendOrdersGateway] Active bill resolution failed.", {
        endpointPath: `/api/bills/table/${parseNumericId(tableId, "table")}`,
        selectedBillId: activeBill?.dbId ?? null,
        selectedTableId: tableId,
      });
      throw new Error(
        "Seçili masa için aktif adisyon bulunamadı. Ürün eklemeden önce masa açık olmalıdır.",
      );
    }

    return activeBill.dbId;
  }

  private async fetchBillById(billId: number) {
    const endpointPath = `/api/bills/${billId}`;

    console.info("[BackendOrdersGateway] Bill refresh started.", {
      endpointPath,
      selectedBillId: billId,
    });

    const response = await this.apiClient.request<BackendBillSummaryDto>({
      debugResponseBody: true,
      method: "GET",
      path: endpointPath,
    });

    const mappedBill = mapBackendBillSummaryToOrderDetail(response);

    if (!Number.isFinite(mappedBill.total)) {
      console.warn("[BackendOrdersGateway] Refreshed bill produced an invalid total after mapping.", {
        billId,
        mappedBill,
        response,
      });
    }

    return mappedBill;
  }
}
