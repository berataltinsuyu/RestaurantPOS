import { BackendOrdersGateway } from "../api/adapters/backend-orders.gateway";
import { BackendPaymentsGateway } from "../api/adapters/backend-payments.gateway";
import { BackendTablesGateway } from "../api/adapters/backend-tables.gateway";
import { SupabaseProductsReadGateway } from "../api/adapters/supabase-products-read.gateway";
import { SupabaseBillsReadGateway } from "../api/adapters/supabase-bills-read.gateway";
import { SupabasePaymentsReadGateway } from "../api/adapters/supabase-payments-read.gateway";
import { SupabaseTablesReadGateway } from "../api/adapters/supabase-tables-read.gateway";
import { MobileApiClient } from "../api/http/api-client";
import { env, envDiagnostics } from "../config/env";
import { BackendService } from "./backend/backend.service";
import { BillsService } from "./bills/bills.service";
import { MenuService } from "./menu/menu.service";
import { OrdersService } from "./orders/orders.service";
import { PaymentsService } from "./payments/payments.service";
import { RealtimeService } from "./realtime/realtime.service";
import { RealtimeSyncService } from "./realtime/realtime-sync.service";
import { MutationRefreshService } from "./sync/mutation-refresh.service";
import { TablesService } from "./tables/tables.service";

const apiClient = new MobileApiClient(env.backend.baseUrl);
const backendService = new BackendService(apiClient);
const realtimeService = new RealtimeService();
const billsReadGateway = new SupabaseBillsReadGateway();
const menuReadGateway = new SupabaseProductsReadGateway();
const paymentsReadGateway = new SupabasePaymentsReadGateway();
const tablesReadGateway = new SupabaseTablesReadGateway();
const billsService = new BillsService(billsReadGateway);
const menuService = new MenuService(menuReadGateway);
const tablesService = new TablesService(
  new BackendTablesGateway(apiClient),
  tablesReadGateway,
  billsReadGateway,
);
const paymentsService = new PaymentsService(
  new BackendPaymentsGateway(apiClient),
  paymentsReadGateway,
);
const mutationRefreshService = new MutationRefreshService(
  tablesService,
  billsService,
  paymentsService,
);

console.info("[composition-root] Mobile data services initialized.", {
  ...envDiagnostics,
  billsReadConfigured: billsReadGateway.isConfigured,
  menuReadConfigured: menuReadGateway.isConfigured,
  paymentsReadConfigured: paymentsReadGateway.isConfigured,
  tablesReadConfigured: tablesReadGateway.isConfigured,
  usingLiveReadAdapters:
    tablesReadGateway.isConfigured &&
    billsReadGateway.isConfigured &&
    paymentsReadGateway.isConfigured,
});

console.log(
  "[Composition] Using Supabase adapters:",
  tablesReadGateway.isConfigured &&
    billsReadGateway.isConfigured &&
    paymentsReadGateway.isConfigured,
);

export const services = {
  backend: backendService,
  bills: billsService,
  menu: menuService,
  orders: new OrdersService(new BackendOrdersGateway(apiClient, menuService)),
  payments: paymentsService,
  realtime: realtimeService,
  realtimeSync: new RealtimeSyncService(
    realtimeService,
    tablesService,
    billsService,
    paymentsService,
  ),
  sync: mutationRefreshService,
  tables: tablesService,
};
