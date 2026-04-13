import { TablesReadGateway } from "../contracts/tables-read.contract";
import { RestaurantTableRecord } from "../../types/domain";
import { env } from "../../config/env";
import { getSupabaseClient, isSupabaseConfigured } from "../../services/supabase/client";
import { normalizeRestaurantTableRecord } from "../mappers/supabase-record-normalizers";

const TABLE_COLUMNS =
  "Id,BranchId,TableNo,Capacity,Status,WaiterId,CurrentBillId,IsMerged,AreaName,CurrentGuestCount,CreatedAt";

export class SupabaseTablesReadGateway implements TablesReadGateway {
  public get isConfigured() {
    return isSupabaseConfigured();
  }

  async listRestaurantTables(): Promise<RestaurantTableRecord[]> {
    const client = getSupabaseClient();
    const branchId = env.branchId;

    if (!client) {
      console.warn("[SupabaseTablesReadGateway] Supabase client is unavailable for RestaurantTables list query.", {
        branchFilter: branchId ?? null,
      });
      return [];
    }

    console.log("[Tables] Query start, branch:", branchId ?? null);
    console.info("[SupabaseTablesReadGateway] Querying RestaurantTables.", {
      branchFilter: branchId ?? null,
      columns: TABLE_COLUMNS,
    });

    let query = client
      .from("RestaurantTables")
      .select(TABLE_COLUMNS)
      .order("TableNo", { ascending: true });

    if (branchId !== undefined) {
      query = query.eq("BranchId", branchId);
    }

    const { data, error } = await query;
    console.log("[Tables] Result count:", data?.length ?? 0);
    console.log("[Tables] Error:", error ?? null);

    if (error) {
      console.error("[SupabaseTablesReadGateway] RestaurantTables query failed.", {
        branchFilter: branchId ?? null,
        code: error.code,
        details: error.details,
        hint: error.hint,
        message: error.message,
      });
      throw error;
    }

    const rowCount = data?.length ?? 0;
    console.info("[SupabaseTablesReadGateway] RestaurantTables query completed.", {
      branchFilter: branchId ?? null,
      rowCount,
    });

    if (rowCount === 0) {
      console.warn("NO DATA → possible causes: wrong BranchId OR RLS");
      console.warn("[SupabaseTablesReadGateway] RestaurantTables returned zero rows.", {
        branchFilter: branchId ?? null,
        possibleCauses: [
          "mobileapp/.env is missing or using the wrong branch id",
          "the selected branch has no RestaurantTables rows",
          "RLS/select policies are blocking mobile reads",
        ],
      });
    }

    return (data ?? []).map(normalizeRestaurantTableRecord);
  }

  async getRestaurantTableById(
    tableId: number,
  ): Promise<RestaurantTableRecord | null> {
    const client = getSupabaseClient();
    const branchId = env.branchId;

    if (!client) {
      console.warn("[SupabaseTablesReadGateway] Supabase client is unavailable for RestaurantTables detail query.", {
        branchFilter: branchId ?? null,
        tableId,
      });
      return null;
    }

    console.info("[SupabaseTablesReadGateway] Querying RestaurantTables detail.", {
      branchFilter: branchId ?? null,
      tableId,
    });

    let query = client
      .from("RestaurantTables")
      .select(TABLE_COLUMNS)
      .eq("Id", tableId);

    if (branchId !== undefined) {
      query = query.eq("BranchId", branchId);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      console.error("[SupabaseTablesReadGateway] RestaurantTables detail query failed.", {
        branchFilter: branchId ?? null,
        code: error.code,
        details: error.details,
        hint: error.hint,
        message: error.message,
        tableId,
      });
      throw error;
    }

    console.info("[SupabaseTablesReadGateway] RestaurantTables detail query completed.", {
      branchFilter: branchId ?? null,
      found: Boolean(data),
      tableId,
    });

    return data ? normalizeRestaurantTableRecord(data) : null;
  }
}
