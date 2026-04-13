import { MenuReadGateway } from "../contracts/menu-read.contract";
import { getSupabaseClient, isSupabaseConfigured } from "../../services/supabase/client";
import { MenuCategory, MenuProduct } from "../../types/domain";

const CATEGORY_TABLE = "ProductCategories";
const PRODUCT_TABLE = "Products";

function asNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : String(value ?? fallback);
}

function asBoolean(value: unknown, fallback = true) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value !== 0;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    if (["false", "0", "hayir", "no", "off", "pasif"].includes(normalized)) {
      return false;
    }

    if (["true", "1", "evet", "yes", "on", "aktif"].includes(normalized)) {
      return true;
    }
  }

  return fallback;
}

function normalizeMenuCategory(row: Record<string, unknown>): MenuCategory {
  return {
    id: asString(row.Id ?? row.id),
    label: asString(row.Name ?? row.DisplayName ?? row.Label ?? row.CategoryName),
    sortOrder: asNumber(
      row.SortOrder ?? row.DisplayOrder ?? row.OrderNo ?? row.DisplayIndex,
      Number.MAX_SAFE_INTEGER,
    ),
  };
}

function normalizeMenuProduct(row: Record<string, unknown>): MenuProduct {
  const isActive = asBoolean(row.IsActive, true);
  const isMenuActive = asBoolean(
    row.IsMenuActive ?? row.MenuActive ?? row.ShowOnMenu ?? row.VisibleOnMenu,
    true,
  );
  const isOutOfStock = asBoolean(
    row.IsOutOfStock ?? row.OutOfStock ?? row.IsSoldOut,
    false,
  );

  return {
    categoryId: asString(row.CategoryId ?? row.CategoryID),
    id: asString(row.Id ?? row.id),
    isAvailable: isActive && isMenuActive && !isOutOfStock,
    name: asString(row.Name ?? row.ProductName ?? row.DisplayName ?? row.Title),
    price: asNumber(row.Price ?? row.SalePrice ?? row.UnitPrice ?? row.ListPrice),
  };
}

function isCategoryActive(row: Record<string, unknown>) {
  return asBoolean(row.IsActive ?? row.Active, true);
}

async function queryTable(
  tableName: string,
  columns: string,
  filterApplied: string,
): Promise<Record<string, unknown>[]> {
  const client = getSupabaseClient() as any;

  console.info("[SupabaseProductsReadGateway] Supabase query started.", {
    columns,
    filterApplied,
    tableName,
  });

  const { data, error } = await client.from(tableName).select(columns);

  if (error) {
    console.error("[SupabaseProductsReadGateway] Supabase query failed.", {
      code: error.code,
      details: error.details,
      filterApplied,
      hint: error.hint,
      message: error.message,
      tableName,
    });
    throw error;
  }

  const rows = (data ?? []) as Record<string, unknown>[];

  console.info("[SupabaseProductsReadGateway] Supabase query completed.", {
    filterApplied,
    rowCount: rows.length,
    tableName,
  });

  return rows;
}

export class SupabaseProductsReadGateway implements MenuReadGateway {
  public get isConfigured() {
    return isSupabaseConfigured();
  }

  async listMenuCategories(): Promise<MenuCategory[]> {
    const client = getSupabaseClient();

    if (!client) {
      console.warn("[SupabaseProductsReadGateway] Menu category query skipped because Supabase client is unavailable.");
      return [];
    }

    const rows = await queryTable(
      CATEGORY_TABLE,
      "Id,Name,IsActive",
      "Global menu schema: no BranchId filter. Categories are filtered client-side by IsActive when present.",
    );

    const activeRows = rows.filter(isCategoryActive);
    const categories = activeRows
      .map(normalizeMenuCategory)
      .filter((category) => category.id && category.label);

    console.info("[SupabaseProductsReadGateway] Menu categories normalized.", {
      activeRowCount: activeRows.length,
      categoryRowCount: categories.length,
      filterApplied:
        "No BranchId filter. Using ProductCategories.IsActive when present.",
    });

    return categories.sort(
      (left, right) =>
        left.sortOrder - right.sortOrder ||
        left.label.localeCompare(right.label, "tr"),
    );
  }

  async listMenuProducts(): Promise<MenuProduct[]> {
    const client = getSupabaseClient();

    if (!client) {
      console.warn("[SupabaseProductsReadGateway] Menu products query skipped because Supabase client is unavailable.");
      return [];
    }

    const rows = await queryTable(
      PRODUCT_TABLE,
      "Id,CategoryId,Name,Price,IsActive,IsMenuActive,IsOutOfStock",
      "Global menu schema: no BranchId filter. Products are filtered client-side by IsActive && IsMenuActive && !IsOutOfStock.",
    );

    const products = rows
      .map(normalizeMenuProduct)
      .filter(
        (product) =>
          product.id &&
          product.categoryId &&
          product.name &&
          Number.isFinite(product.price),
      );

    console.info("[SupabaseProductsReadGateway] Menu products normalized.", {
      filterApplied:
        "No BranchId filter. Using Products.IsActive, IsMenuActive, IsOutOfStock.",
      productRowCount: products.length,
    });

    return products.sort((left, right) =>
      left.name.localeCompare(right.name, "tr"),
    );
  }
}
