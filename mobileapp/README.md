# mobileapp

`mobileapp/` is the real React Native waiter handheld application for this repository.

`figmadesign/` is reference-only design material. It is useful for flow, layout direction, and component intent, but it is not runtime code and must not be imported into the mobile app.

## Scope

- Root `src/` remains the existing web frontend and stays untouched.
- `backend/` remains the existing `.NET` backend and stays untouched.
- `mobileapp/` is a standalone Expo-managed React Native TypeScript workspace.
- The mobile app is prepared for the same Supabase PostgreSQL database used by the web POS.
- Supabase Realtime and future `.NET` backend integration are prepared through service boundaries only.
- Final backend integration is intentionally not implemented yet.

## Waiter Flow Structure

The current navigation structure is aligned to the real waiter handheld product:

- `Login`
- `TablesOverview`
  Masa plani entry point for the waiter session.
- `TableDetail`
  Table-level context for guests, totals, waiter assignment, and navigation into actions or orders.
- `OrderDetail`
  Active order review and waiter actions.
- `MenuSelection`
  Product selection flow for adding items to an order.
- `TableActions`
  Open, move, merge, and split table actions.
- `Payment`
  Payment method selection and transition into payment subflows.
- `SplitPayment`
  Separate flow for split settlement preparation.
- `CardPosRedirect`
  Explicit handoff route for external POS or card-terminal integration.
- `ContactlessPrompt`
  Explicit prompt route for card tap / contactless confirmation.
- `PaymentSuccess`
  Flow completion route that returns the waiter to restaurant operations.

## Folder Responsibilities

- `src/app`
  Application shell, providers, and waiter-flow screens.
- `src/app/screens/auth`
  Waiter authentication flow only.
- `src/app/screens/tables`
  Masa plani, table detail, and table action screens.
- `src/app/screens/orders`
  Order detail and menu/product selection screens.
- `src/app/screens/payments`
  Payment, split payment, POS redirect, contactless, and success screens.
- `src/components`
  Reusable React Native building blocks used by the waiter flows.
- `src/components/common`
  Shared waiter UI primitives: buttons, filter chips, section headers, summary cards, status chips, inline info rows, and bottom action areas.
- `src/components/tables`
  Reusable table-focused cards for masa plani and table-state presentation.
- `src/components/payments`
  Reusable payment-selection cards and payment-flow presentation blocks.
- `src/navigation`
  Native stack configuration and typed route params for the waiter app.
- `src/services`
  Production-facing application services organized by domain.
- `src/services/tables`
  Table operations and table-domain orchestration.
- `src/services/orders`
  Order and menu-related orchestration.
- `src/services/bills`
  Read-only bill hydration aligned with the shared Supabase schema.
- `src/services/payments`
  Payment orchestration, read-only payment hydration, and future POS/backend handoff points.
- `src/services/realtime`
  Supabase Realtime client access and app-level sync orchestration.
- `src/api`
  Contracts, adapters, and HTTP transport boundaries.
- `src/state`
  Lightweight waiter app state for session, tables, orders, and payment intent.
- `src/theme`
  Mobile theme tokens only: colors, typography, spacing, radii, and shadows tailored to the waiter handheld UI.
- `src/constants`
  Route constants, formatters, and mock reference data.
- `src/types`
  Waiter-domain types and app-level shared types.
- `src/config`
  Environment parsing for Supabase and backend readiness.

## Service Boundaries

The mobile architecture is intentionally centered on a few waiter-specific modules:

- `TablesService`
  Read `RestaurantTables` state and keep waiter table summaries aligned with the active bill.
- `BillsService`
  Read `Bills` and `BillItems` snapshots for the current table context.
- `OrdersService`
  Retrieve active orders, read menu products, and add/update order lines.
- `PaymentsService`
  Read `Payments` rows by `BillId`, group split payment rows by `SplitPaymentGroupId`, and keep mock POS flows isolated from database writes.
- `RealtimeSyncService`
  Subscribe to Supabase Realtime table, order, and payment changes.
- `BackendService`
  Placeholder `.NET` backend bridge for future API connectivity and health checks.

Each service depends on a contract under `src/api/contracts` and can be backed by either Supabase read adapters or local mock adapters without changing the screen routing model.

The current setup uses a mixed integration boundary:

- Supabase read gateways are active for `RestaurantTables`, `Bills`, `BillItems`, and `Payments` when environment variables are configured.
- Mock command gateways remain in place for waiter-side actions that will later move behind the `.NET` backend.
- No mobile runtime path writes directly to shared Supabase tables.

## Shared Schema Mapping

`mobileapp/` now follows the same bill-based model as the existing POS:

- `Table` in mobile maps to `RestaurantTables`
- active order context maps to `Bills`
- order lines map to `BillItems`
- payment history and split entries map to `Payments`

Type alignment rules:

- database identifiers are handled as numeric ids at the service and Supabase layer
- status columns stay aligned to backend integer enums
- monetary values are normalized into numeric fields before they enter the mobile domain
- UI-facing ids can still remain string-based where navigation already depends on them

## Read Flow And Realtime

The mobile read strategy is intentionally read-only:

- tables list reads from `RestaurantTables`
- active bill reads from `Bills` using `CurrentBillId`
- bill lines read from `BillItems` by `BillId`
- payments read from `Payments` by `BillId`

Realtime synchronization is scoped for waiter screens:

- `RestaurantTables` updates refresh the masa list and current table state
- `Bills` updates refresh totals and active bill status
- `Payments` updates refresh payment progress and settlement state
- subscriptions are created per screen scope and always return cleanup functions for unsubscribe

## Split Payment Alignment

Split payment preparation is aligned to the shared schema without performing writes:

- one bill can have multiple `Payments` rows
- `SplitPaymentGroupId` is the grouping key for related split entries
- `PaidAmount` and `RemainingAmount` are treated as backend-owned bill totals
- mobile UI can stage split intents locally, but authoritative totals still come from backend-managed bill state

## Naming Conventions

- Screen files use product-specific names such as `TablesOverviewScreen` and `CardPosRedirectScreen`.
- Route keys match the waiter product flow rather than generic sample-app sections.
- Service classes, contracts, and types use the same domain language: `tables`, `orders`, `payments`, `realtime`.
- Mobile-only runtime code lives entirely inside `mobileapp/`.

## Design System Foundation

The reusable UI foundation in `mobileapp/` is based on the attached mobile mockups first and `figmadesign/` second.

- The attached screenshots are the primary source of truth for waiter handheld visual direction.
- `figmadesign/` remains reference-only for layout, component feel, and flow intent.
- No runtime code is imported from `figmadesign/` or the web frontend.
- Theme tokens under `src/theme` define the shared visual language for tables, order detail, menu selection, payment, split payment, and card payment states.
- Reusable components under `src/components` are the intended foundation for final React Native screen implementation.

Current reusable primitives include:

- `Button`
  Primary, secondary, soft, and danger button styles for waiter actions and bottom action areas.
- `SectionHeader`
  Shared top-of-screen title block with eyebrow, subtitle, and right-side status content.
- `SurfaceCard`
  Rounded card surface with tone support for neutral, info, brand, warning, success, and purple states.
- `FilterChip`
  Compact selection chip for masa filtering and category switching.
- `SummaryCard`
  High-emphasis amount or KPI card for totals and table summaries.
- `StatusChip`
  Realtime, table, and order status indicator chip.
- `TableCard`
  Waiter-focused table card for masa plani grids.
- `PaymentMethodCard`
  Payment option card for card, cash, and split settlement flows.
- `ActionTile`
  Table action row for move, merge, split, and open operations.
- `InfoRow`
  Inline label/value pair for order and payment summaries.
- `BottomActionBar`
  Sticky safe-area-aware action area for handheld primary actions.

## Environment

Copy `.env.example` to `.env` when integration work begins:

```bash
cp .env.example .env
```

Variables:

- `EXPO_PUBLIC_ENVIRONMENT`
- `EXPO_PUBLIC_BRANCH_ID`
- `EXPO_PUBLIC_ENABLE_REALTIME`
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `EXPO_PUBLIC_BACKEND_BASE_URL`

## Supabase Read Safety

- `mobileapp/` is aligned to the shared bill-based schema:
  `RestaurantTables`, `Bills`, `BillItems`, and `Payments`.
- Mobile read access is prepared through Supabase and Realtime only.
- Mobile must not insert or update `RestaurantTables`, `Bills`, or `Payments` directly.
- Final write operations will be routed through the `.NET` backend later.

## Getting Started

1. Install dependencies inside `mobileapp/`:

```bash
cd mobileapp
npm install
```

2. Optional: copy the example environment file for local validation. The current mock data flow works without real backend credentials, so you can leave placeholder values while validating UI and navigation.

```bash
cp .env.example .env
```

3. Start the Expo development server:

```bash
npm run start
```

If Metro cache behaves unexpectedly, start with a clean cache instead:

```bash
npm run start:clear
```

4. Run on Android:

```bash
npm run android
```

Use either:

- an Android emulator started from Android Studio, or
- a physical Android device with Expo Go / development build support available on the same network.

## Development Checklist

Use the following checklist after installing dependencies and launching the app:

- Login flow
  Confirm the waiter can enter the mock login screen and continue into the app shell.
- Tables screen
  Confirm `Masa Planı` opens, summary cards render, filters switch correctly, and empty tables still show the `Aç` action.
- Table actions
  Confirm the `Masa İşlemleri` entry opens the action sheet and routes into table action screens without dead navigation.
- Payment screen
  Confirm order summary and the three payment method cards render and the bottom `Tahsil Et` action remains visible.
- Split payment
  Confirm multiple payment entries can be added, overpayment is blocked, and completion stays disabled until remaining balance reaches `₺0.00`.
- Card POS flow
  Confirm the redirect screen auto-advances, the contactless screen supports `İptal` and retry/error handling, and success returns to waiter operations.

## Commands

```bash
npm install
npm run start
npm run start:clear
npm run android
npm run ios
npm run typecheck
npm run doctor
```

## Boundaries To Keep

- Do not import runtime code from the root web app into `mobileapp/`.
- Do not import runtime code from `figmadesign/` into `mobileapp/`.
- Use `figmadesign/` only as visual and flow reference material.
- Keep waiter operations mobile-focused. Admin, reporting, and web back-office concerns do not belong in this workspace.
