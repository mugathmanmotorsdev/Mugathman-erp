"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Users,
  Heart,
  Mail,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserMinus,
  ShieldCheck,
  Eye,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userCreateSchema } from "@/lib/validatoion/user";
import * as z from "zod";

type UserStatus = "ACTIVE" | "PENDING" | "INACTIVE";
type Role = "ADMIN" | "EDITOR" | "VIEWER";

interface User {
  id: string;
  full_name: string;
  email: string;
  role: Role;
  status: UserStatus;
  created_at: string;
}

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
        setUsers(data.users);
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

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
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
    <div className="flex flex-col gap-6 p-6 bg-slate-50/50 min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-end pb-2">
        <div className="space-y-1">
          <h1 className="text-[32px] font-bold text-[#1A1C1E] tracking-tight">
            Users
          </h1>
          <p className="text-slate-500 text-[15px] font-medium">
            Manage employee permissions and dealer access control.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#3E2792] hover:bg-[#322075] text-white px-5 h-11 rounded-xl flex gap-2.5 text-sm font-bold shadow-[0_4px_12px_rgba(62,39,146,0.3)] transition-all hover:-translate-y-0.5 active:translate-y-0">
              <Plus size={20} strokeWidth={3} />
              Invite New User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[440px] rounded-3xl p-8 border-none shadow-2xl">
            <DialogHeader className="space-y-4">
              <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-2">
                <Mail size={28} />
              </div>
              <DialogTitle className="text-2xl font-bold text-slate-900">
                Invite Team Member
              </DialogTitle>
              <DialogDescription className="text-slate-500 text-base">
                The user will receive an email to set up their password and
                activate their account.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6 pt-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-slate-700 font-bold text-[13px] uppercase tracking-wider">
                        Full Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Jane Cooper"
                          className="h-12 border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white transition-all shadow-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-slate-700 font-bold text-[13px] uppercase tracking-wider">
                        Email Address
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="jane.cooper@truckpro.com"
                          className="h-12 border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white transition-all shadow-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-slate-700 font-bold text-[13px] uppercase tracking-wider">
                        System Role
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-12 border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white transition-all shadow-none">
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                          <SelectItem
                            value="ADMIN"
                            className="py-3 font-medium"
                          >
                            Admin
                          </SelectItem>
                          <SelectItem
                            value="EDITOR"
                            className="py-3 font-medium"
                          >
                            Editor
                          </SelectItem>
                          <SelectItem
                            value="VIEWER"
                            className="py-3 font-medium"
                          >
                            Viewer
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <DialogFooter className="pt-4 flex !justify-between gap-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsDialogOpen(false)}
                    className="h-12 rounded-xl flex-1 font-bold text-slate-500"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[#3E2792] hover:bg-[#322075] h-12 rounded-xl flex-1 font-bold shadow-lg shadow-indigo-100"
                  >
                    Send Invitation
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-[0_2px_8px_rgba(0,0,0,0.02)] rounded-2xl overflow-hidden">
          <CardContent className="p-7 flex justify-between items-center bg-white">
            <div className="space-y-2">
              <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">
                Total Employees
              </p>
              <h3 className="text-[44px] font-black text-[#1A1C1E] leading-none tracking-tighter">
                {users.length}
              </h3>
            </div>
            <div className="w-[60px] h-[60px] rounded-2xl bg-[#F1F3F9] flex items-center justify-center text-[#5C6170]">
              <Users size={30} strokeWidth={2.5} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-[0_2px_8px_rgba(0,0,0,0.02)] rounded-2xl overflow-hidden">
          <CardContent className="p-7 flex justify-between items-center bg-white">
            <div className="space-y-2">
              <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">
                Active Now
              </p>
              <h3 className="text-[44px] font-black text-emerald-500 leading-none tracking-tighter">
                {users.filter((u) => u.status === "ACTIVE").length}
              </h3>
            </div>
            <div className="w-[60px] h-[60px] rounded-2xl bg-[#E7F7F0] flex items-center justify-center text-emerald-500">
              <Heart
                size={30}
                strokeWidth={2.5}
                fill="currentColor"
                className="opacity-80"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-[0_2px_8_rgba(0,0,0,0.02)] rounded-2xl overflow-hidden">
          <CardContent className="p-7 flex justify-between items-center bg-white">
            <div className="space-y-2">
              <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">
                Pending Invites
              </p>
              <h3 className="text-[44px] font-black text-amber-500 leading-none tracking-tighter">
                {users.filter((u) => u.status === "PENDING").length}
              </h3>
            </div>
            <div className="w-[60px] h-[60px] rounded-2xl bg-[#FFF8EB] flex items-center justify-center text-amber-500">
              <Mail
                size={30}
                strokeWidth={2.5}
                fill="currentColor"
                className="opacity-80"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search Section */}
      <Card className="border-none shadow-[0_2px_8px_rgba(0,0,0,0.02)] bg-white rounded-2xl">
        <CardContent className="p-4 flex flex-wrap gap-4 items-center">
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
        </CardContent>
      </Card>

      {/* Users Table Card */}
      <Card className="border-none shadow-[0_2px_12px_rgba(0,0,0,0.03)] bg-white rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#F8F9FA]/60 border-b border-slate-100">
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
                      We couldn't find any users matching your current
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
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.full_name}&backgroundColor=F1F3F9`}
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
                          <DropdownMenuItem className="flex items-center gap-3 py-3 rounded-xl cursor-pointer font-bold text-slate-700 text-[13px] px-3 focus:bg-indigo-50 focus:text-[#3E2792]">
                            <Eye size={18} strokeWidth={2.5} />
                            View Detailed Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex items-center gap-3 py-3 rounded-xl cursor-pointer font-bold text-slate-700 text-[13px] px-3 focus:bg-indigo-50 focus:text-[#3E2792]">
                            <ShieldCheck size={18} strokeWidth={2.5} />
                            Update Permissions
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-slate-50 mx-2" />
                          {user.status !== "INACTIVE" && (
                            <DropdownMenuItem
                              onClick={() => deactivateUser(user.id)}
                              className="flex items-center gap-3 py-3 rounded-xl cursor-pointer font-bold text-rose-600 text-[13px] px-3 focus:bg-rose-50 focus:text-rose-700"
                            >
                              <UserMinus size={18} strokeWidth={2.5} />
                              Deactivate Account
                            </DropdownMenuItem>
                          )}
                          {user.status === "INACTIVE" && (
                            <DropdownMenuItem className="flex items-center gap-3 py-3 rounded-xl cursor-pointer font-bold text-emerald-600 text-[13px] px-3 focus:bg-emerald-50 focus:text-emerald-700">
                              <UserCheck size={18} strokeWidth={2.5} />
                              Re-activate Account
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
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
      </Card>
    </div>
  );
}
