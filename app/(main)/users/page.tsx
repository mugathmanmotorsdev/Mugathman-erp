"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Users,
  Check,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userCreateSchema } from "@/lib/validatoion/user";
import * as z from "zod";
import { AdminOnly } from "@/components/RoleGuard";
import PageHeading from "@/components/PageHeading";
import StatCard from "@/components/StatCard";
import NewUserDialog from "@/components/NewUserDialog";
import UserRow from "@/components/UserRow";


import { User, Role, UserStatus } from "@/types/user";
import SkeletonUi from "@/components/SkeletonUi";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const form = useForm<z.infer<typeof userCreateSchema>>({
    resolver: zodResolver(userCreateSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "VIEWER",
    },
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/users");
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      if (data.users) {
        // Convert date strings to Date objects
        const formattedUsers = data.users.map((user: User) => ({
          ...user,
          created_at: new Date(user.created_at),
        }));
        setUsers(formattedUsers);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof userCreateSchema>) => {
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create user");
      }

      toast.success("Invitation sent to " + values.email);
      setIsDialogOpen(false);
      form.reset();
      fetchUsers();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create user",
      );
    }
  };

  const deactivateUser = async (id: string) => {
    try {
      const response = await fetch(`/api/users/${id}/deactivate`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to deactivate user");

      toast.success("User deactivated successfully");
      fetchUsers();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Action failed");
    }
  };

  const reactivateUser = async (id: string) => {
    try {
      const response = await fetch(`/api/users/${id}/activate`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to reactivate user");

      toast.success("User reactivated successfully");
      fetchUsers();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Action failed");
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus =
      statusFilter === "all" || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadge = (role: Role) => {
    const styles = {
      ADMIN: "bg-blue-50 text-blue-600 border-blue-100",
      EDITOR: "bg-emerald-50 text-emerald-600 border-emerald-100",
      VIEWER: "bg-purple-50 text-purple-600 border-purple-100",
    };
    return (
      <Badge
        variant="outline"
        className={`${styles[role] || "bg-gray-50 text-gray-600"} px-2.5 py-0.5 font-bold text-[10px] uppercase tracking-wider rounded-md border shadow-none`}
      >
        {role.replace("_", " ")}
      </Badge>
    );
  };

  const getStatusContent = (status: UserStatus) => {
    const configs = {
      ACTIVE: {
        color: "bg-emerald-500",
        text: "text-emerald-600",
        label: "Active",
      },
      PENDING: {
        color: "bg-amber-500",
        text: "text-amber-600",
        label: "Pending",
      },
      INACTIVE: {
        color: "bg-slate-400",
        text: "text-slate-500",
        label: "Inactive",
      },
    };
    const config = configs[status] || configs.PENDING;
    return (
      <div className="flex items-center gap-2">
        <span className={`w-1.5 h-1.5 rounded-full ${config.color}`}></span>
        <span className={`${config.text} text-[13px] font-semibold`}>
          {config.label}
        </span>
      </div>
    );
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const past = date; // Already a Date object
    const diff = now.getTime() - past.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    return `${days} days ago`;
  };

  return (
    <AdminOnly
    loadingFallback={<SkeletonUi />}
    >
      <div className="flex flex-col gap-6 p-6 bg-[#EFF3F4] min-h-screen">
        {/* Header Section */}
        <div className="flex justify-between items-end pb-2">
          <PageHeading
            title="Users"
            description="Manage employee permissions and dealer access control." />

          {/* new user dialog */}
          <NewUserDialog
            form={form}
            onSubmit={onSubmit}
            isDialogOpen={isDialogOpen}
            setIsDialogOpen={setIsDialogOpen}
          />
        </div>

        {/* Stats Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* users amount */}
          <StatCard
            title="Total Employees"
            stat={users.length}
            icon={<Users size={30} strokeWidth={2.5} className="text-[#3E2792]" />}
            iconBg="bg-[#F1F3F9]"
          />

          {/* active users */}
          <StatCard
            title="Active Now"
            stat={users.filter((u) => u.status === "ACTIVE").length}
            icon={<Check size={30} strokeWidth={2.5} className="text-green-500" />}
            iconBg="bg-green-50"
          />

          {/* pending invites */}
          <StatCard
            title="Pending Invite"
            stat={users.filter((u) => u.status === "PENDING").length}
            icon={<Clock size={30} strokeWidth={2.5} className="text-yellow-500" />}
            iconBg="bg-yellow-50"
          />
        </div>

        {/* Filters & Search Section */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-[340px]">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={20}
              />
              <Input
                placeholder="Search employees by name, email or role..."
                className="pl-12 bg-[#F1F3F9] border-none h-[52px] rounded-xl text-[15px] placeholder:text-slate-400 placeholder:font-medium focus-visible:ring-1 focus-visible:ring-indigo-100 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[150px] border-slate-200 h-[52px] rounded-xl text-[13px] font-bold text-slate-700 transition-all hover:bg-slate-50 border shadow-none">
                <div className="flex items-center gap-1.5 uppercase tracking-tighter">
                  <span className="text-slate-400 font-bold">Role:</span>
                  <SelectValue placeholder="All" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all" className="font-bold text-xs">
                  ALL
                </SelectItem>
                <SelectItem value="ADMIN" className="font-bold text-xs">
                  ADMIN
                </SelectItem>
                <SelectItem value="EDITOR" className="font-bold text-xs">
                  EDITOR
                </SelectItem>
                <SelectItem value="VIEWER" className="font-bold text-xs">
                  VIEWER
                </SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[170px] border-slate-200 h-[52px] rounded-xl text-[13px] font-bold text-slate-700 uppercase tracking-tighter transition-all hover:bg-slate-50 border shadow-none">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 font-bold">Status:</span>
                  <SelectValue placeholder="Any" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all" className="font-bold text-xs">
                  ANY
                </SelectItem>
                <SelectItem value="ACTIVE" className="font-bold text-xs">
                  ACTIVE
                </SelectItem>
                <SelectItem value="PENDING" className="font-bold text-xs">
                  PENDING
                </SelectItem>
                <SelectItem value="INACTIVE" className="font-bold text-xs">
                  INACTIVE
                </SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              className="h-[52px] px-6 gap-2.5 border-slate-200 text-slate-700 font-bold text-[13px] uppercase tracking-wider rounded-xl hover:bg-slate-50 bg-white shadow-none transition-all"
            >
              <Filter size={18} />
              More Filters
            </Button>
          </div>
        </div>

        {/* Users Table Card */}
        <div className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/60 border-b border-slate-100">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="w-[64px] pl-8 py-5">
                    <Checkbox className="rounded-md border-slate-300 w-5 h-5 data-[state=checked]:bg-[#3E2792] data-[state=checked]:border-[#3E2792]" />
                  </TableHead>
                  <TableHead className="text-[12px] font-bold text-slate-400 uppercase tracking-[0.1em] py-5">
                    User Name
                  </TableHead>
                  <TableHead className="text-[12px] font-bold text-slate-400 uppercase tracking-[0.1em] py-5">
                    Email Address
                  </TableHead>
                  <TableHead className="text-[12px] font-bold text-slate-400 uppercase tracking-[0.1em] py-5">
                    System Role
                  </TableHead>
                  <TableHead className="text-[12px] font-bold text-slate-400 uppercase tracking-[0.1em] py-5">
                    Account Status
                  </TableHead>
                  <TableHead className="text-[12px] font-bold text-slate-400 uppercase tracking-[0.1em] py-5">
                    Last Activity
                  </TableHead>
                  <TableHead className="text-right pr-8 py-5 text-[12px] font-bold text-slate-400 uppercase tracking-[0.1em]">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <TableRow
                      key={i}
                      className="animate-pulse border-b border-slate-50"
                    >
                      <TableCell className="pl-8 py-6">
                        <div className="w-5 h-5 bg-slate-100 rounded-md"></div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 bg-slate-100 rounded-full"></div>
                          <div className="w-32 h-4 bg-slate-100 rounded-lg"></div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="w-48 h-4 bg-slate-100 rounded-lg"></div>
                      </TableCell>
                      <TableCell>
                        <div className="w-20 h-7 bg-slate-100 rounded-lg"></div>
                      </TableCell>
                      <TableCell>
                        <div className="w-24 h-4 bg-slate-100 rounded-lg"></div>
                      </TableCell>
                      <TableCell>
                        <div className="w-28 h-4 bg-slate-100 rounded-lg"></div>
                      </TableCell>
                      <TableCell className="text-right pr-8">
                        <div className="w-9 h-9 bg-slate-100 rounded-xl ml-auto"></div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredUsers.length === 0 ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell
                      colSpan={7}
                      className="text-center py-28 space-y-4"
                    >
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                        <Users size={32} />
                      </div>
                      <p className="text-slate-400 font-bold text-lg uppercase tracking-tight">
                        No match found
                      </p>
                      <p className="text-slate-500 text-sm max-w-xs mx-auto">
                        We couldn&apos;t find any users matching your current
                        filters. Try adjusting your search criteria.
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchQuery("");
                          setRoleFilter("all");
                          setStatusFilter("all");
                        }}
                        className="mt-4 rounded-xl font-bold h-11"
                      >
                        Clear all filters
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <UserRow
                      key={user.id}
                      user={{ ...user }}
                      deactivateUser={deactivateUser}
                      reactivateUser={reactivateUser}
                      getRoleBadge={getRoleBadge}
                      getStatusContent={getStatusContent}
                      getTimeAgo={getTimeAgo}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Section */}
          <div className="px-8 py-5 border-t border-slate-50 flex items-center justify-between bg-[#F8F9FA]/30">
            <div className="text-[13px] font-bold text-slate-400 uppercase tracking-wider">
              Page 1 of {Math.ceil(filteredUsers.length / 10) || 1}
            </div>
            <div className="flex items-center gap-2.5">
              <Button
                variant="outline"
                size="sm"
                className="h-10 px-5 rounded-xl border-slate-200 text-slate-600 font-bold hover:bg-white shadow-sm transition-all disabled:opacity-50"
                disabled
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-10 px-5 rounded-xl border-slate-200 text-slate-600 font-bold hover:bg-white shadow-sm transition-all"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AdminOnly>
  );
}
