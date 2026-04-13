import { OrdersGateway } from "../contracts/orders.contract";
import {
  mockOrdersFixture,
} from "./mock-fixtures";
import {
  AddMenuProductInput,
  MenuProduct,
  OrderDetail,
  UpdateOrderLineQuantityInput,
} from "../../types/domain";

function cloneOrder(order: OrderDetail): OrderDetail {
  return {
    ...order,
    items: order.items.map((item) => ({ ...item })),
  };
}

function recalculateTotals(order: OrderDetail): OrderDetail {
  const subtotal = order.items.reduce(
    (runningTotal, item) => runningTotal + item.quantity * item.unitPrice,
    0,
  );

  return {
    ...order,
    subtotal,
    total: subtotal + order.tax,
    updatedAt: new Date().toISOString(),
  };
}

function buildEmptyOrder(tableId: string): OrderDetail {
  return {
    id: `order-${tableId}`,
    items: [],
    status: "open",
    subtotal: 0,
    tableId,
    tax: 0,
    total: 0,
    updatedAt: new Date().toISOString(),
  };
}

export class MockOrdersGateway implements OrdersGateway {
  constructor(
    private readonly menuCatalog: {
      getMenuProductById: (productId: string) => Promise<MenuProduct | null>;
      listMenuProducts: () => Promise<MenuProduct[]>;
    },
  ) {}

  async getOrderByTableId(tableId: string): Promise<OrderDetail | null> {
    const order = mockOrdersFixture[tableId];
    return order ? cloneOrder(order) : null;
  }

  async listMenuProducts(): Promise<MenuProduct[]> {
    return this.menuCatalog.listMenuProducts();
  }

  async addMenuProduct(input: AddMenuProductInput): Promise<OrderDetail> {
    const product = await this.menuCatalog.getMenuProductById(input.productId);

    if (!product) {
      throw new Error("Product could not be found in the live menu catalog.");
    }

    const existingOrderRecord = mockOrdersFixture[input.tableId];
    const existingOrder = existingOrderRecord
      ? cloneOrder(existingOrderRecord)
      : buildEmptyOrder(input.tableId);
    const existingLine = existingOrder.items.find(
      (item) => item.productId === input.productId,
    );

    if (existingLine) {
      existingLine.quantity += input.quantity;
    } else {
      existingOrder.items.push({
        id: `line-${product.id}-${Date.now()}`,
        name: product.name,
        note: "",
        productId: product.id,
        quantity: input.quantity,
        unitPrice: product.price,
      });
    }

    const updatedOrder = recalculateTotals(existingOrder);
    mockOrdersFixture[input.tableId] = updatedOrder;
    return cloneOrder(updatedOrder);
  }

  async updateOrderLineQuantity(
    input: UpdateOrderLineQuantityInput,
  ): Promise<OrderDetail> {
    const existingOrderRecord = mockOrdersFixture[input.tableId];
    const existingOrder = existingOrderRecord
      ? cloneOrder(existingOrderRecord)
      : buildEmptyOrder(input.tableId);

    existingOrder.items = existingOrder.items
      .map((item) =>
        item.id === input.orderLineId
          ? { ...item, quantity: input.quantity }
          : item,
      )
      .filter((item) => item.quantity > 0);

    const updatedOrder = recalculateTotals(existingOrder);
    mockOrdersFixture[input.tableId] = updatedOrder;
    return cloneOrder(updatedOrder);
  }
}
