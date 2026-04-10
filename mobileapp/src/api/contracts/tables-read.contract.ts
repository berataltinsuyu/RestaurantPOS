import { RestaurantTableRecord } from "../../types/domain";

export interface TablesReadGateway {
  readonly isConfigured: boolean;
  listRestaurantTables(): Promise<RestaurantTableRecord[]>;
  getRestaurantTableById(
    tableId: number,
  ): Promise<RestaurantTableRecord | null>;
}
