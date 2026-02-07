import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { User } from "@generated/prisma";

export function useAuth() {
    const {data: session, status} = useSession()
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchUserDetails = async () => {
        try {
            const response = await fetch("/api/me")
            const data = await response.json()
            setUser(data)
        } catch (error) {
            console.error("Error fetching user details:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (status === "loading") return

        if (session?.user?.email) {
            fetchUserDetails()
        } else {
            setUser(null)
            setLoading(false)
        }
    }, [session, status])


    return {
        user,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === "ADMIN"
    }
}

export function useRoleGuard() {
    const { user } = useAuth()

    if (!user) {
       return false
    }

    if (!user.role) {
        return false
    }

    return true
}
