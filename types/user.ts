type Role = "ADMIN" | "EDITOR" | "VIEWER";
type UserStatus = "ACTIVE" | "PENDING" | "INACTIVE";

interface User {
    id: string;
    full_name: string;
    email: string;
    role: Role;
    status: UserStatus;
    created_at: Date;
}

export type { Role, UserStatus, User };