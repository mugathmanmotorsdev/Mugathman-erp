import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export function useAuth() {
    const session = useSession()

    if (session.status !== "authenticated" && session.status !== "loading") {
        redirect("/api/auth/signin")
    }
}