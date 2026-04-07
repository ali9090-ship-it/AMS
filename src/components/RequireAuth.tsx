import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import type { UserRole } from "@/lib/auth";

export function RequireAuth({ allowedRoles, children }: { allowedRoles: UserRole[]; children: React.ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!allowedRoles.includes(user.role)) {
    const home = user.role === "admin" ? "/admin" : user.role === "teacher" ? "/teacher" : "/";
    return <Navigate to={home} replace />;
  }

  return <>{children}</>;
}
