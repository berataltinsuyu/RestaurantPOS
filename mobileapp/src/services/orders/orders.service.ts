import { OrdersGateway } from "../../api/contracts/orders.contract";
import {
  AddMenuProductInput,
  UpdateOrderLineQuantityInput,
} from "../../types/domain";

export class OrdersService {
  constructor(private readonly gateway: OrdersGateway) {}

  getOrderByTableId(tableId: string) {
    return this.gateway.getOrderByTableId(tableId);
  }

  listMenuProducts() {
    return this.gateway.listMenuProducts();
  }

  addMenuProduct(input: AddMenuProductInput) {
    return this.gateway.addMenuProduct(input);
  }

  updateOrderLineQuantity(input: UpdateOrderLineQuantityInput) {
    return this.gateway.updateOrderLineQuantity(input);
  }
}
