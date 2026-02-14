import { TableCell, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye, ShieldCheck, UserMinus, UserCheck } from "lucide-react";
import { Role, User, UserStatus } from "@/types/user";
import { useAvatar } from "@/hooks/useAvatar";


export default function UserRow({
    user,
    getRoleBadge,
    getStatusContent,
    getTimeAgo,
    deactivateUser,
    reactivateUser
}: {
    user: User,
    getRoleBadge: (role: Role) => React.ReactNode,
    getStatusContent: (status: UserStatus) => React.ReactNode,
    getTimeAgo: (date: Date) => string,
    deactivateUser: (id: string) => void,
    reactivateUser: (id: string) => void
}) {
    // generate avatar for user
    const avatar = useAvatar(user.email, 90)

    return (
        <TableRow
            key={user.id}
            className="group hover:bg-[#F8F9FF]/40 border-b border-slate-50 transition-all duration-200"
        >
            <TableCell className="pl-8 py-4.5">
                <Checkbox className="rounded-md border-slate-200 w-5 h-5 data-[state=checked]:bg-[#3E2792] data-[state=checked]:border-[#3E2792]" />
            </TableCell>
            <TableCell className="py-4.5">
                <div className="flex items-center gap-3.5">
                    <Avatar className="h-11 w-11 border-2 border-white shadow-sm ring-1 ring-slate-100 group-hover:ring-indigo-200 transition-all">
                        <AvatarImage
                            src={avatar}
                        />
                        <AvatarFallback className="bg-slate-100 text-slate-500 font-bold text-xs uppercase">
                            {user.full_name
                                ?.split(" ")
                                .map((n) => n[0])
                                .join("")}
                        </AvatarFallback>
                    </Avatar>
                    <span className="font-black text-[#1A1C1E] text-[15px] tracking-tight group-hover:text-[#3E2792] transition-colors">
                        {user.full_name}
                    </span>
                </div>
            </TableCell>
            <TableCell className="py-4.5 font-semibold text-slate-500 text-[14px]">
                {user.email}
            </TableCell>
            <TableCell className="py-4.5">
                {getRoleBadge(user.role)}
            </TableCell>
            <TableCell className="py-4.5">
                {getStatusContent(user.status)}
            </TableCell>
            <TableCell className="py-4.5 font-semibold text-slate-400 text-[14px]">
                {getTimeAgo(user.created_at)}
            </TableCell>
            <TableCell className="text-right pr-8 py-4.5">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="h-10 w-10 p-0 rounded-xl hover:bg-[#E8EBFD] text-slate-400 hover:text-[#3E2792] transition-all"
                        >
                            <MoreHorizontal size={22} strokeWidth={2.5} />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        className="w-56 p-2 rounded-2xl border-slate-100 shadow-2xl animate-in fade-in-0 zoom-in-95"
                    >
                        <DropdownMenuLabel className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-3 py-2">
                            Account Control
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-slate-50 mx-2" />
                        {user.status !== "INACTIVE" && user.role !== "ADMIN" && (
                            <DropdownMenuItem
                                onClick={() => deactivateUser(user.id)}
                                className="flex items-center gap-3 py-3 rounded-xl cursor-pointer font-bold text-rose-600 text-[13px] px-3 focus:bg-rose-50 focus:text-rose-700"
                            >
                                <UserMinus size={18} strokeWidth={2.5} />
                                Deactivate Account
                            </DropdownMenuItem>
                        )}
                        {user.status === "INACTIVE" && (
                            <DropdownMenuItem
                                onClick={() => reactivateUser(user.id)}
                                className="flex items-center gap-3 py-3 rounded-xl cursor-pointer font-bold text-emerald-600 text-[13px] px-3 focus:bg-emerald-50 focus:text-emerald-700">
                                <UserCheck size={18} strokeWidth={2.5} />
                                Re-activate Account
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    );
}