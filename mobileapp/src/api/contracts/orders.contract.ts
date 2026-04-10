import {
  AddMenuProductInput,
  MenuProduct,
  OrderDetail,
  UpdateOrderLineQuantityInput,
} from "../../types/domain";

export interface OrdersGateway {
  getOrderByTableId(tableId: string): Promise<OrderDetail | null>;
  listMenuProducts(): Promise<MenuProduct[]>;
  addMenuProduct(input: AddMenuProductInput): Promise<OrderDetail>;
  updateOrderLineQuantity(
    input: UpdateOrderLineQuantityInput,
  ): Promise<OrderDetail>;
}
