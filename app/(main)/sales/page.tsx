"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  ShoppingCart,
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
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import PageHeading from "@/components/PageHeading";
import StatCard from "@/components/StatCard";

interface Sale {
  id: string;
  sale_number: string;
  customer: {
    full_name: string;
    phone: string;
  };
  user: {
    full_name: string;
  };
  status: string;
  created_at: string;
  sale_items: Array<{
    id: string;
    quantity: number;
    unit_price: string;
    product: {
      name: string;
    };
  }>;
}

export default function SalesPage() {
  const router = useRouter();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchSales = async () => {
    try {
      const res = await fetch("/api/sales");
      if (res.ok) {
        const data = await res.json();
        setSales(data);
      } else {
        toast.error("Failed to load sales");
      }
    } catch (error) {
      console.error("Error fetching sales", error);
      toast.error("Internal server error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const calculateTotal = (items: Sale["sale_items"]) => {
    return items.reduce((acc, item) => acc + item.quantity * parseFloat(item.unit_price), 0);
  };

  const filteredSales = sales.filter(
    (s) =>
      s.sale_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.customer.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.customer.phone.includes(searchQuery),
  );

  return (
    <div className="flex flex-col gap-6 p-6 bg-[#EFF3F4] min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeading
          title="Sales Orders"
          description="Track and manage your customer transactions."
        />
        <div className="flex items-center gap-3">
          <Button
            onClick={() => router.push("/sales/new")}
            className="bg-[#150150] hover:bg-[#150150]/90 text-white px-6 h-12 rounded-2xl font-bold shadow-lg shadow-indigo-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Sale Order
          </Button>
        </div>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* total sales */}
        <StatCard
        title="Total Sales" 
        stat={sales.length} 
        icon={<ShoppingCart className="h-6 w-6" />} 
        iconBg="bg-indigo-50"
        />
        {/* revenue */}
        <StatCard
        title="Revenue"
        stat={sales.reduce((acc, s) => acc + calculateTotal(s.sale_items), 0).toLocaleString()}
        icon={<div className="font-bold text-xl">$</div>}
        iconBg="bg-emerald-50"
        />
        {/* avg order value */}
        <StatCard
        title="Avg. Order Value"
        stat={sales.length > 0 ? (sales.reduce((acc, s) => acc + calculateTotal(s.sale_items), 0) / sales.length).toLocaleString(undefined, {maximumFractionDigits: 0}) : 0}
        icon={<Filter className="h-6 w-6" />}
        iconBg="bg-orange-50"
        />
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by order #, customer name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 pl-12 bg-slate-50/50 border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="h-12 px-6 rounded-2xl border-slate-200 font-bold text-slate-600">
              <Calendar className="h-4 w-4 mr-2" />
              Past 30 Days
            </Button>
            <Button variant="outline" className="h-12 px-6 rounded-2xl border-slate-200 font-bold text-slate-600">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-y border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Order Info</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Customer</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Items</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Amount</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={6} className="px-6 py-4"><div className="h-12 w-full bg-slate-100 animate-pulse rounded-xl" /></td>
                    </tr>
                  ))
                ) : filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center text-slate-400">
                      <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-5" />
                      <p className="text-lg font-medium">No sales orders found</p>
                      <Button variant="link" onClick={() => router.push("/sales/new")} className="text-indigo-600 font-bold mt-2">
                        Create your first sale
                      </Button>
                    </td>
                  </tr>
                ) : (
                  filteredSales.map((sale) => (
                    <tr key={sale.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="font-black text-slate-900">{sale.sale_number}</span>
                          <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Calendar className="h-3 w-3" />
                            {new Date(sale.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-700">{sale.customer.full_name}</span>
                          <span className="text-xs text-slate-500">{sale.customer.phone}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <Badge variant="secondary" className="bg-slate-100 text-slate-600 rounded-lg">
                          {sale.sale_items.length} Products
                        </Badge>
                      </td>
                      <td className="px-6 py-5">
                        <span className="font-black text-slate-900">
                          ${calculateTotal(sale.sale_items).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <Badge
                          className={`rounded-lg px-3 py-1 font-bold ${
                            sale.status === "COMPLETED"
                              ? "bg-emerald-50 text-emerald-600 border-none"
                              : "bg-slate-100 text-slate-500 border-none"
                          }`}
                        >
                          {sale.status}
                        </Badge>
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
                              <Search className="h-4 w-4 text-slate-400" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem className="py-2.5 rounded-xl flex items-center gap-2 cursor-pointer">
                              <Download className="h-4 w-4 text-slate-400" />
                              Download Invoice
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
      </div>
    </div>
  );
}
