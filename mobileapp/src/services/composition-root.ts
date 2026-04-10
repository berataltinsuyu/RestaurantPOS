import { SupabaseBillsReadGateway } from "../api/adapters/supabase-bills-read.gateway";
import { SupabasePaymentsReadGateway } from "../api/adapters/supabase-payments-read.gateway";
import { SupabaseTablesReadGateway } from "../api/adapters/supabase-tables-read.gateway";
import { MockOrdersGateway } from "../api/adapters/mock-orders.gateway";
import { MockPaymentsGateway } from "../api/adapters/mock-payments.gateway";
import { MockTablesGateway } from "../api/adapters/mock-tables.gateway";
import { MobileApiClient } from "../api/http/api-client";
import { env } from "../config/env";
import { BackendService } from "./backend/backend.service";
import { BillsService } from "./bills/bills.service";
import { OrdersService } from "./orders/orders.service";
import { PaymentsService } from "./payments/payments.service";
import { RealtimeService } from "./realtime/realtime.service";
import { RealtimeSyncService } from "./realtime/realtime-sync.service";
import { TablesService } from "./tables/tables.service";

const apiClient = new MobileApiClient(env.backend.baseUrl);
const realtimeService = new RealtimeService();
const billsReadGateway = new SupabaseBillsReadGateway();
const paymentsReadGateway = new SupabasePaymentsReadGateway();
const tablesReadGateway = new SupabaseTablesReadGateway();
const billsService = new BillsService(billsReadGateway);
const tablesService = new TablesService(
  new MockTablesGateway(),
  tablesReadGateway,
  billsReadGateway,
);
const paymentsService = new PaymentsService(
  new MockPaymentsGateway(),
  paymentsReadGateway,
);

export const services = {
  backend: new BackendService(apiClient),
  bills: billsService,
  orders: new OrdersService(new MockOrdersGateway()),
  payments: paymentsService,
  realtime: realtimeService,
  realtimeSync: new RealtimeSyncService(
    realtimeService,
    tablesService,
    billsService,
    paymentsService,
  ),
  tables: tablesService,
};
