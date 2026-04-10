import { TablesReadGateway } from "../contracts/tables-read.contract";
import { RestaurantTableRecord } from "../../types/domain";
import { env } from "../../config/env";
import { getSupabaseClient, isSupabaseConfigured } from "../../services/supabase/client";
import { normalizeRestaurantTableRecord } from "../mappers/supabase-record-normalizers";

const TABLE_COLUMNS =
  "Id,BranchId,TableNo,Capacity,Status,WaiterId,CurrentBillId,IsMerged,AreaName,CurrentGuestCount,CreatedAt";

export class SupabaseTablesReadGateway implements TablesReadGateway {
  public readonly isConfigured = isSupabaseConfigured();

  async listRestaurantTables(): Promise<RestaurantTableRecord[]> {
    const client = getSupabaseClient();

    if (!client) {
      return [];
    }

    let query = client
      .from("RestaurantTables")
      .select(TABLE_COLUMNS)
      .order("TableNo", { ascending: true });

    if (env.branchId !== undefined) {
      query = query.eq("BranchId", env.branchId);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return (data ?? []).map(normalizeRestaurantTableRecord);
  }

  async getRestaurantTableById(
    tableId: number,
  ): Promise<RestaurantTableRecord | null> {
    const client = getSupabaseClient();

    if (!client) {
      return null;
    }

    let query = client
      .from("RestaurantTables")
      .select(TABLE_COLUMNS)
      .eq("Id", tableId);

    if (env.branchId !== undefined) {
      query = query.eq("BranchId", env.branchId);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      throw error;
    }

    return data ? normalizeRestaurantTableRecord(data) : null;
  }
}
