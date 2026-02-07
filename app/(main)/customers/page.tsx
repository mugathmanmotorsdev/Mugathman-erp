"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Search,
  Plus,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Calendar,
  MoreVertical,
  Download,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Customer {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  address: string | null;
  created_at: string;
}

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchCustomers = async () => {
    try {
      const res = await fetch("/api/customers");
      if (res.ok) {
        const data = await res.json();
        setCustomers(data);
      } else {
        toast.error("Failed to load customers");
      }
    } catch (error) {
      console.error("Error fetching customers", error);
      toast.error("Internal server error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(
    (c) =>
      c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  return (
    <div className="flex flex-col gap-6 p-8 bg-slate-50/50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Customer Directory</h1>
          <p className="text-slate-500">Manage your relationship with clients and prospects.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => router.push("/sales/new")}
            className="bg-[#150150] hover:bg-[#150150]/90 text-white px-6 h-12 rounded-2xl font-bold shadow-lg shadow-indigo-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Customer Entry
          </Button>
        </div>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-3xl border-none shadow-xl shadow-slate-200/50 bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Total Clients</p>
                <h3 className="text-3xl font-black text-slate-900 mt-1">{customers.length}</h3>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card className="rounded-3xl border-none shadow-xl shadow-slate-200/50 bg-white">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by name, phone or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 pl-12 bg-slate-50/50 border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="h-12 px-6 rounded-2xl border-slate-200 font-bold text-slate-600">
              <Download className="h-4 w-4 mr-2" />
              Export List
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card className="rounded-3xl border-none shadow-xl shadow-slate-200/50 bg-white overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-y border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Client Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Contact Info</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Address</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Joined On</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={5} className="px-6 py-4"><div className="h-12 w-full bg-slate-100 animate-pulse rounded-xl" /></td>
                    </tr>
                  ))
                ) : filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center text-slate-400">
                      <Users className="h-16 w-16 mx-auto mb-4 opacity-5" />
                      <p className="text-lg font-medium">No customers found</p>
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                            {customer.full_name.charAt(0)}
                          </div>
                          <span className="font-bold text-slate-900">{customer.full_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
                            <Phone className="h-3 w-3 text-slate-400" /> {customer.phone}
                          </span>
                          {customer.email && (
                            <span className="text-xs text-slate-500 flex items-center gap-2">
                              <Mail className="h-3 w-3 text-slate-400" /> {customer.email}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm text-slate-600 flex items-start gap-2 max-w-[200px]">
                          <MapPin className="h-3 w-3 text-slate-400 mt-1 shrink-0" />
                          <span className="truncate">{customer.address || "Not specified"}</span>
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm font-medium text-slate-500 flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          {new Date(customer.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-xl">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-2xl border-slate-200">
                            <DropdownMenuItem className="py-2.5 rounded-xl flex items-center gap-2 cursor-pointer">
                              <ArrowRight className="h-4 w-4 text-slate-400" />
                              View Purchase History
                            </DropdownMenuItem>
                            <DropdownMenuItem className="py-2.5 rounded-xl flex items-center gap-2 cursor-pointer text-rose-600 focus:text-rose-600 focus:bg-rose-50">
                              Archive Client
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
