import { MenuCategory, MenuProduct } from "../../types/domain";

export interface MenuReadGateway {
  readonly isConfigured: boolean;
  listMenuCategories(): Promise<MenuCategory[]>;
  listMenuProducts(): Promise<MenuProduct[]>;
}
