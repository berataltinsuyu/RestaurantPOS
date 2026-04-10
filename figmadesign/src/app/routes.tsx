import { createBrowserRouter } from "react-router";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import BillDetail from "./pages/BillDetail";
import Payment from "./pages/Payment";
import Processing from "./pages/Processing";
import Success from "./pages/Success";
import Failed from "./pages/Failed";
import History from "./pages/History";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import RefundCancel from "./pages/RefundCancel";
import TerminalManagement from "./pages/TerminalManagement";
import TableOperations from "./pages/TableOperations";
import EndOfDayReconciliation from "./pages/EndOfDayReconciliation";
import RolePermissionMatrix from "./pages/RolePermissionMatrix";
import PaymentError from "./pages/PaymentError";
import ErrorStateTester from "./pages/ErrorStateTester";
import ComponentShowcase from "./pages/ComponentShowcase";

// Mobile imports
import MobileLogin from "./mobile/MobileLogin";
import MobileTables from "./mobile/MobileTables";
import TableActionMenu from "./mobile/TableActionMenu";
import MobileOrder from "./mobile/MobileOrder";
import MobileMenu from "./mobile/MobileMenu";
import MobilePayment from "./mobile/MobilePayment";
import PaymentSuccess from "./mobile/PaymentSuccess";
import OpenTable from "./mobile/OpenTable";
import MoveTable from "./mobile/MoveTable";
import MergeTable from "./mobile/MergeTable";
import SplitTable from "./mobile/SplitTable";
import SplitPayment from "./mobile/SplitPayment";
import TableSelection from "./mobile/TableSelection";
import POSRedirect from "./mobile/POSRedirect";
import ContactlessPrompt from "./mobile/ContactlessPrompt";
import CardProcessing from "./mobile/CardProcessing";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Login,
  },
  {
    path: "/dashboard",
    Component: Dashboard,
  },
  {
    path: "/bill/:tableId",
    Component: BillDetail,
  },
  {
    path: "/payment/:tableId",
    Component: Payment,
  },
  {
    path: "/processing",
    Component: Processing,
  },
  {
    path: "/success",
    Component: Success,
  },
  {
    path: "/failed",
    Component: Failed,
  },
  {
    path: "/payment-error",
    Component: PaymentError,
  },
  {
    path: "/error-tester",
    Component: ErrorStateTester,
  },
  {
    path: "/components",
    Component: ComponentShowcase,
  },
  {
    path: "/split-payment/:tableId",
    Component: SplitPayment,
  },
  {
    path: "/history",
    Component: History,
  },
  {
    path: "/reports",
    Component: Reports,
  },
  {
    path: "/settings",
    Component: Settings,
  },
  {
    path: "/refund-cancel",
    Component: RefundCancel,
  },
  {
    path: "/terminal-management",
    Component: TerminalManagement,
  },
  {
    path: "/table-operations",
    Component: TableOperations,
  },
  {
    path: "/end-of-day",
    Component: EndOfDayReconciliation,
  },
  {
    path: "/role-permissions",
    Component: RolePermissionMatrix,
  },
  {
    path: "/mobile/login",
    Component: MobileLogin,
  },
  {
    path: "/mobile/tables",
    Component: MobileTables,
  },
  {
    path: "/mobile/table-action/:tableId",
    Component: TableActionMenu,
  },
  {
    path: "/mobile/order/:tableId",
    Component: MobileOrder,
  },
  {
    path: "/mobile/menu/:tableId",
    Component: MobileMenu,
  },
  {
    path: "/mobile/payment/:tableId",
    Component: MobilePayment,
  },
  {
    path: "/mobile/payment-success/:tableId",
    Component: PaymentSuccess,
  },
  {
    path: "/mobile/open-table/:tableId",
    Component: OpenTable,
  },
  {
    path: "/mobile/move-table/:tableId",
    Component: MoveTable,
  },
  {
    path: "/mobile/merge-table/:tableId",
    Component: MergeTable,
  },
  {
    path: "/mobile/split-table/:tableId",
    Component: SplitTable,
  },
  {
    path: "/mobile/split-payment/:tableId",
    Component: SplitPayment,
  },
  {
    path: "/mobile/table-selection",
    Component: TableSelection,
  },
  {
    path: "/mobile/pos-redirect/:tableId",
    Component: POSRedirect,
  },
  {
    path: "/mobile/contactless-prompt/:tableId",
    Component: ContactlessPrompt,
  },
  {
    path: "/mobile/card-processing/:tableId",
    Component: CardProcessing,
  },
]);