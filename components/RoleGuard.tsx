import { useAuth, useRoleGuard } from "@/hooks/useauth";

export function RoleGuard({
  children,
  allowedRoles,
  fallback,
  loadingFallback
}: {
  children: React.ReactNode;
  allowedRoles: string[];
  fallback?: React.ReactNode;
  loadingFallback?: React.ReactNode;
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return loadingFallback || <div>Loading...</div>;
  }

  if (!allowedRoles.includes(user?.role || "")) {
    return fallback || <div>Unauthorized</div>;
  }

  return children;
}

export function AdminOnly({ 
    children,
    fallback,
    loadingFallback
}: { 
    children: React.ReactNode;
    fallback?: React.ReactNode;
    loadingFallback?: React.ReactNode;
}) {
  return (
    <RoleGuard
      allowedRoles={["ADMIN"]}
      fallback={fallback}
      loadingFallback={loadingFallback}
    >
      {children}
    </RoleGuard>
  );
}

export function EditorOnly({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard
      allowedRoles={["ADMIN", "EDITOR"]}
      fallback={<div>Editor access required</div>}
    >
      {children}
    </RoleGuard>
  );
}
