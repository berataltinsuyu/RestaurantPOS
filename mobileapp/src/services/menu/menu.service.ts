import { MenuReadGateway } from "../../api/contracts/menu-read.contract";
import { MenuCategory, MenuProduct } from "../../types/domain";

interface MenuCatalog {
  categories: MenuCategory[];
  products: MenuProduct[];
}

export class MenuService {
  private cachedCatalog: MenuCatalog = {
    categories: [],
    products: [],
  };

  constructor(private readonly readGateway: MenuReadGateway) {}

  public get isReadConfigured() {
    return this.readGateway.isConfigured;
  }

  async listMenuCatalog(): Promise<MenuCatalog> {
    const [categories, products] = await Promise.all([
      this.readGateway.listMenuCategories(),
      this.readGateway.listMenuProducts(),
    ]);

    const activeCategoryIds = new Set(categories.map((category) => category.id));
    const activeProducts = products.filter(
      (product) => product.isAvailable && activeCategoryIds.has(product.categoryId),
    );
    const categoriesById = new Set(activeProducts.map((product) => product.categoryId));
    const filteredCategories = categories.filter((category) =>
      categoriesById.has(category.id),
    );

    console.info("[MenuService] Menu catalog assembled.", {
      activeCategoryCount: filteredCategories.length,
      activeProductCount: activeProducts.length,
      categoryRowCount: categories.length,
      productRowCount: products.length,
    });

    this.cachedCatalog = {
      categories: filteredCategories,
      products: activeProducts,
    };

    return this.cachedCatalog;
  }

  async listMenuProducts() {
    return (await this.listMenuCatalog()).products;
  }

  async getMenuProductById(productId: string): Promise<MenuProduct | null> {
    const cachedProduct = this.cachedCatalog.products.find(
      (product) => product.id === productId,
    );

    if (cachedProduct) {
      return cachedProduct;
    }

    const { products } = await this.listMenuCatalog();
    return products.find((product) => product.id === productId) ?? null;
  }
}
