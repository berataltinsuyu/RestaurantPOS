import { useState, type PropsWithChildren } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AccessDeniedState } from "./enterprise/AccessDeniedState";
import { hasAnyPermission, hasAnyRole, type AppPermission, type AppRole } from "../lib/authorization";
import { AppSidebar } from "./AppSidebar";
import { TopBar } from "./TopBar";

interface ProtectedRouteProps extends PropsWithChildren {
  allowedRoles?: readonly AppRole[];
  allowedPermissions?: readonly AppPermission[];
}

export function ProtectedRoute({ children, allowedRoles, allowedPermissions }: ProtectedRouteProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { session, isAuthenticated, isBootstrapped } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isBootstrapped) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="rounded-2xl border border-gray-200 bg-white px-8 py-6 shadow-sm">
          <div className="text-sm font-medium text-gray-600">Oturum doğrulanıyor...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/"
        replace
        state={{ from: `${location.pathname}${location.search}${location.hash}` }}
      />
    );
  }

  const roleAllowed = !allowedRoles?.length || hasAnyRole(session, allowedRoles);
  const permissionAllowed = !allowedPermissions?.length || hasAnyPermission(session, allowedPermissions);

  if (!roleAllowed || !permissionAllowed) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="lg:ml-64">
          <TopBar onMenuClick={() => setSidebarOpen(true)} />

          <div className="px-4 pb-6 pt-20 lg:px-6 lg:pb-8">
            <div className="mx-auto max-w-4xl">
              <AccessDeniedState
                onBack={() => navigate(-1)}
                onHome={() => navigate("/dashboard")}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
