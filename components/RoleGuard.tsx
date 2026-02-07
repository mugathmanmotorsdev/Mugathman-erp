import { useAuth, useRoleGuard } from "@/hooks/useauth"

export function RoleGuard({ children, allowedRoles, fallback }: { children: React.ReactNode, allowedRoles: string[], fallback?: React.ReactNode }) {
    const { user, loading } = useAuth()

    if (loading) {
        return <div>Loading...</div>
    }

    if (!allowedRoles.includes(user?.role || "")) {
        return fallback || <div>Unauthorized</div>
    }

    return children
}

export function AdminOnly({ children }: { children: React.ReactNode }) {
    return (
        <RoleGuard
            allowedRoles={["ADMIN"]}
            fallback={<div>Admin access required</div>}
        >
            {children}
        </RoleGuard>
    )
}

export function EditorOnly({ children }: { children: React.ReactNode }) {
    return (
        <RoleGuard
            allowedRoles={["ADMIN", "EDITOR"]}
            fallback={<div>Editor access required</div>}
        >
            {children}
        </RoleGuard>
    )
}
