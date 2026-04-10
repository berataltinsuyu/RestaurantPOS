import {
  MOCK_MENU_PRODUCTS,
  MOCK_ORDERS,
  MOCK_TABLES,
} from "../../constants/mock-data";
import {
  MenuProduct,
  OrderDetail,
  TableSummary,
} from "../../types/domain";

function cloneOrder(order: OrderDetail): OrderDetail {
  return {
    ...order,
    items: order.items.map((item) => ({ ...item })),
  };
}

export const mockTablesFixture: TableSummary[] = MOCK_TABLES.map((table) => ({
  ...table,
}));

export const mockOrdersFixture: Record<string, OrderDetail> = Object.fromEntries(
  Object.entries(MOCK_ORDERS).map(([tableId, order]) => [
    tableId,
    cloneOrder(order),
  ]),
);

export const mockMenuProductsFixture: MenuProduct[] = MOCK_MENU_PRODUCTS.map(
  (product) => ({ ...product }),
);
