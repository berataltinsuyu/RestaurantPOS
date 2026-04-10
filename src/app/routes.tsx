import type { ReactNode } from "react";
import { createBrowserRouter } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { appPermissions, appRoles, type AppPermission, type AppRole } from "./lib/authorization";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import BillDetail from "./pages/BillDetail";
import Payment from "./pages/Payment";
import Processing from "./pages/Processing";
import Success from "./pages/Success";
import Failed from "./pages/Failed";
import SplitPayment from "./pages/SplitPayment";
import History from "./pages/History";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import MenuManagement from "./pages/MenuManagement";
import RefundCancel from "./pages/RefundCancel";
import TerminalManagement from "./pages/TerminalManagement";
import TableOperations from "./pages/TableOperations";
import EndOfDayReconciliation from "./pages/EndOfDayReconciliation";
import RolePermissionMatrix from "./pages/RolePermissionMatrix";
import PaymentError from "./pages/PaymentError";
import ErrorStateTester from "./pages/ErrorStateTester";
import ComponentShowcase from "./pages/ComponentShowcase";

const withProtection = (
  component: ReactNode,
  options?: {
    allowedRoles?: readonly AppRole[];
    allowedPermissions?: readonly AppPermission[];
  },
) => (
  <ProtectedRoute allowedRoles={options?.allowedRoles} allowedPermissions={options?.allowedPermissions}>
    {component}
  </ProtectedRoute>
);

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Login,
  },
  {
    path: "/dashboard",
    element: withProtection(<Dashboard />),
  },
  {
    path: "/bill/:tableId",
    element: withProtection(<BillDetail />),
  },
  {
    path: "/payment/:tableId",
    element: withProtection(<Payment />),
  },
  {
    path: "/processing",
    element: withProtection(<Processing />),
  },
  {
    path: "/success",
    element: withProtection(<Success />),
  },
  {
    path: "/failed",
    element: withProtection(<Failed />),
  },
  {
    path: "/payment-error",
    element: withProtection(<PaymentError />),
  },
  {
    path: "/error-tester",
    element: withProtection(<ErrorStateTester />),
  },
  {
    path: "/components",
    element: withProtection(<ComponentShowcase />),
  },
  {
    path: "/split-payment/:tableId",
    element: withProtection(<SplitPayment />),
  },
  {
    path: "/history",
    element: withProtection(<History />),
  },
  {
    path: "/reports",
    element: withProtection(<Reports />, { allowedRoles: [appRoles.cashier, appRoles.branchManager, appRoles.systemAdministrator] }),
  },
  {
    path: "/settings",
    element: withProtection(<Settings />, { allowedRoles: [appRoles.branchManager, appRoles.systemAdministrator] }),
  },
  {
    path: "/menu-management",
    element: withProtection(<MenuManagement />, { allowedPermissions: [appPermissions.menuManagement] }),
  },
  {
    path: "/refund-cancel",
    element: withProtection(<RefundCancel />, { allowedRoles: [appRoles.cashier, appRoles.branchManager, appRoles.systemAdministrator] }),
  },
  {
    path: "/terminal-management",
    element: withProtection(<TerminalManagement />),
  },
  {
    path: "/table-operations",
    element: withProtection(<TableOperations />),
  },
  {
    path: "/end-of-day",
    element: withProtection(<EndOfDayReconciliation />, { allowedRoles: [appRoles.cashier, appRoles.branchManager, appRoles.systemAdministrator] }),
  },
  {
    path: "/role-permissions",
    element: withProtection(<RolePermissionMatrix />, { allowedRoles: [appRoles.branchManager, appRoles.systemAdministrator] }),
  },
]);
