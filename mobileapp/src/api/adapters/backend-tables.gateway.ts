import { TablesGateway } from "../contracts/tables.contract";
import { MobileApiClient } from "../http/api-client";
import {
  MergeTablesInput,
  MoveTableInput,
  OpenTableInput,
  SplitTableInput,
  TableSummary,
} from "../../types/domain";
import { mapRestaurantTableStatusCode } from "../mappers/supabase-domain.mappers";

interface BackendTableSummaryDto {
  Id: number;
  TableNo: string;
  Capacity: number;
  Status: number | string;
  WaiterName?: string | null;
  CurrentGuestCount: number;
  CreatedAt: string;
  CurrentTotal: number;
  AreaName: string;
  CurrentBillId?: number | null;
}

function toFiniteNumber(
  value: unknown,
  field: string,
  context: Record<string, unknown>,
  fallback = 0,
) {
  const numericValue = Number(value);

  if (Number.isFinite(numericValue)) {
    return numericValue;
  }

  console.warn("[BackendTablesGateway] Invalid numeric field received. Falling back to 0.", {
    ...context,
    fallback,
    field,
    rawValue: value,
  });

  return fallback;
}

function toTableSummary(dto: BackendTableSummaryDto): TableSummary {
  const normalizedLabel =
    /^masa\b/i.test(dto.TableNo) || /^m[-\s]?\d/i.test(dto.TableNo)
      ? dto.TableNo
      : `Masa ${dto.TableNo}`;
  const numericContext = {
    tableId: dto.Id ?? null,
    tableNo: dto.TableNo ?? null,
  };

  return {
    activeOrderId:
      dto.CurrentBillId !== null && dto.CurrentBillId !== undefined
        ? String(dto.CurrentBillId)
        : undefined,
    areaLabel: dto.AreaName,
    assignedWaiterName: dto.WaiterName ?? undefined,
    guestCount: toFiniteNumber(
      dto.CurrentGuestCount,
      "CurrentGuestCount",
      numericContext,
    ),
    id: String(dto.Id),
    label: normalizedLabel,
    seats: toFiniteNumber(dto.Capacity, "Capacity", numericContext),
    status: mapBackendTableStatus(dto.Status),
    totalAmount: toFiniteNumber(dto.CurrentTotal, "CurrentTotal", numericContext),
    updatedAt: dto.CreatedAt,
  };
}

function parseNumericTableId(tableId: string) {
  const numericId = Number(tableId);

  if (!Number.isFinite(numericId)) {
    const fallbackMatch = tableId.match(/(\d+)/);

    if (fallbackMatch) {
      return Number(fallbackMatch[1]);
    }

    throw new Error(`Invalid table id: ${tableId}`);
  }

  return numericId;
}

function mapBackendTableStatus(status: number | string) {
  if (typeof status === "number") {
    return mapRestaurantTableStatusCode(status);
  }

  switch (status) {
    case "Dolu":
      return "occupied";
    case "OdemeBekliyor":
      return "paymentPending";
    case "Odendi":
      return "paid";
    case "Bos":
    default:
      return "empty";
  }
}

export class BackendTablesGateway implements TablesGateway {
  constructor(private readonly apiClient: MobileApiClient) {}

  async listTables(): Promise<TableSummary[]> {
    const response = await this.apiClient.request<BackendTableSummaryDto[]>({
      method: "GET",
      path: "/api/tables",
    });

    return response.map(toTableSummary);
  }

  async getTable(tableId: string): Promise<TableSummary | null> {
    const numericTableId = parseNumericTableId(tableId);
    const response = await this.apiClient.request<BackendTableSummaryDto>({
      method: "GET",
      path: `/api/tables/${numericTableId}`,
    });

    return response ? toTableSummary(response) : null;
  }

  async openTable(input: OpenTableInput): Promise<TableSummary> {
    const numericTableId = parseNumericTableId(input.tableId);
    const numericWaiterId = Number(input.waiterId);

    if (!Number.isFinite(numericWaiterId)) {
      throw new Error(`Invalid waiter id: ${input.waiterId}`);
    }

    const payload = {
      GuestCount: input.guestCount,
      WaiterId: numericWaiterId,
    };

    console.info("[BackendTablesGateway] Open table started.", {
      endpoint: `/api/tables/${numericTableId}/open`,
      payload,
    });

    const response = await this.apiClient.request<BackendTableSummaryDto>({
      body: JSON.stringify(payload),
      debugBody: payload,
      method: "POST",
      path: `/api/tables/${numericTableId}/open`,
    });

    console.info("[BackendTablesGateway] Open table completed.", {
      responseTableId: response.Id,
      status: response.Status,
    });

    return toTableSummary(response);
  }

  async moveTable(input: MoveTableInput): Promise<TableSummary> {
    const sourceTableId = parseNumericTableId(input.sourceTableId);
    const targetTableId = parseNumericTableId(input.targetTableId);
    const payload = {
      TargetTableId: targetTableId,
    };

    console.info("[BackendTablesGateway] Move table started.", {
      endpoint: `/api/tables/${sourceTableId}/move`,
      payload,
    });

    const response = await this.apiClient.request<BackendTableSummaryDto>({
      body: JSON.stringify(payload),
      debugBody: payload,
      method: "POST",
      path: `/api/tables/${sourceTableId}/move`,
    });

    console.info("[BackendTablesGateway] Move table completed.", {
      responseTableId: response.Id,
      sourceTableId,
      targetTableId,
    });

    return toTableSummary(response);
  }

  async mergeTables(input: MergeTablesInput): Promise<TableSummary> {
    const sourceTableId = parseNumericTableId(input.sourceTableId);
    const targetTableId = parseNumericTableId(input.targetTableId);
    const payload = {
      TargetTableIds: [targetTableId],
    };

    console.info("[BackendTablesGateway] Merge tables started.", {
      endpoint: `/api/tables/${sourceTableId}/merge`,
      payload,
    });

    const response = await this.apiClient.request<BackendTableSummaryDto>({
      body: JSON.stringify(payload),
      debugBody: payload,
      method: "POST",
      path: `/api/tables/${sourceTableId}/merge`,
    });

    console.info("[BackendTablesGateway] Merge tables completed.", {
      responseTableId: response.Id,
      sourceTableId,
      targetTableId,
    });

    return toTableSummary(response);
  }

  async splitTable(input: SplitTableInput): Promise<TableSummary> {
    const sourceTableId = parseNumericTableId(input.sourceTableId);
    const newTableNo = input.targetTableId.replace(/[^\d]/g, "") || input.targetTableId;
    const payload = {
      AreaName: "İç Salon",
      BillItemIds: input.itemIds
        .map((itemId) => Number(itemId))
        .filter((itemId) => Number.isFinite(itemId)),
      NewTableNo: newTableNo,
    };

    console.info("[BackendTablesGateway] Split table started.", {
      endpoint: `/api/tables/${sourceTableId}/split`,
      payload,
    });

    const response = await this.apiClient.request<BackendTableSummaryDto>({
      body: JSON.stringify(payload),
      debugBody: payload,
      method: "POST",
      path: `/api/tables/${sourceTableId}/split`,
    });

    console.info("[BackendTablesGateway] Split table completed.", {
      newTableNo,
      responseTableId: response.Id,
      sourceTableId,
    });

    return toTableSummary(response);
  }
}
