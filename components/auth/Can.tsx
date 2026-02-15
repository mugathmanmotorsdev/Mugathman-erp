import { User, Role } from "@generated/prisma"

export default function Can({roles, user, children}: {roles: Role[], user: User, children: React.ReactNode}) {
    if (roles.includes(user.role)) {
        return children
    }

    return null
}