"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  ShoppingCart,
  Calendar,
  MoreVertical,
  Download,
  Printer,
  DollarSign,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import SearchInput from "@/components/ui/SearchInput";
import FilterBar from "@/components/ui/FilterBar";
import FilterSelect from "@/components/ui/FilterSelect";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sale } from "@/types/sale";
import { useFormatCurrency } from "@/hooks/use-formatcurrency";


export default function SalesPage() {
  const router = useRouter();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("ALL");

  const fetchSales = async () => {
    try {
      setError(null);
      const res = await fetch("/api/sales", { credentials: "include" });
      if (!res.ok) {
        throw new Error(`HTTP error: ${res.status}`);
      }
      const data = await res.json();
      setSales(data);
    } catch (error) {
      console.error("Error fetching sales", error);
      setError(error instanceof Error ? error.message : "Failed to load sales");
      toast.error("Failed to load sales");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const calculateTotal = (items: Sale["sale_items"]) => {
    return items.reduce((acc, item) => acc + item.quantity * Number(item.unit_price), 0);
  };

  const filteredSales = sales.filter(
    (s) =>
      (paymentStatusFilter === "ALL" || s.payment_status === paymentStatusFilter) &&
      (s.sale_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.customer.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.customer.phone.includes(searchQuery)),
  );

  const totalRevenue = sales.reduce((acc, s) => acc + calculateTotal(s.sale_items), 0);
  const { formattedAmountWithUnit: formattedTotalRevenue } = useFormatCurrency(totalRevenue);
  const totalPaid = sales.reduce((acc, s) => {
    const paid = s.payments.reduce((pAcc, p) => pAcc + Number(p.amount), 0);
    return acc + paid;
  }, 0);
  const { formattedAmountWithUnit: formattedTotalPaid } = useFormatCurrency(totalPaid);
  const outstanding = totalRevenue - totalPaid;
  const { formattedAmountWithUnit: formattedOutstanding } = useFormatCurrency(outstanding);

  const getPaymentStatusBadge = (status: string) => {
    const config = {
      PENDING: {
        bg: "bg-slate-100",
        text: "text-slate-500",
        border: "border-slate-200",
        label: "Pending",
      },
      PARTIALLY_PAID: {
        bg: "bg-amber-50",
        text: "text-amber-600",
        border: "border-amber-100",
        label: "Partially Paid",
      },
      PAID: {
        bg: "bg-emerald-50",
        text: "text-emerald-600",
        border: "border-emerald-100",
        label: "Paid",
      },
    };
    const cfg = config[status as keyof typeof config] || config.PENDING;

    return (
      <Badge className={`${cfg.bg} ${cfg.text} ${cfg.border} border px-3 py-1 font-bold`}>
        {cfg.label}
      </Badge>
    );
  };

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
            variant="outline"
            className="h-10 px-4 rounded-xl border-slate-200 font-bold text-sm text-slate-600"
            onClick={() => {
              const params = new URLSearchParams()
              if (searchQuery) params.set("search", searchQuery)
              if (paymentStatusFilter !== "ALL") params.set("paymentStatus", paymentStatusFilter)
              window.open(`/api/export/sales?${params.toString()}`, "_blank")
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
          stat={formattedTotalRevenue}
          icon={<DollarSign className="h-6 w-6" />}
          iconBg="bg-emerald-50"
        />
        {/* total paid */}
        <StatCard
          title="Total Paid"
          stat={formattedTotalPaid}
          icon={<CheckCircle className="h-6 w-6" />}
          iconBg="bg-emerald-50"
        />
        {/* outstanding */}
        <StatCard
          title="Outstanding"
          stat={formattedOutstanding}
          icon={<AlertTriangle className="h-6 w-6" />}
          iconBg="bg-amber-50"
        />
      </div>

      {/* Search & Filter */}
      <FilterBar>
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by order #, customer name or phone..."
        />
        <FilterSelect
          options={[
            { label: "All Status", value: "ALL" },
            { label: "Paid", value: "PAID" },
            { label: "Partially Paid", value: "PARTIALLY_PAID" },
            { label: "Pending", value: "PENDING" },
          ]}
          value={paymentStatusFilter}
          onValueChange={setPaymentStatusFilter}
          triggerClassName="w-[170px] h-12 border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-white shadow-none"
          placeholder="Payment Status"
        />
      </FilterBar>

      {/* Sales Table */}
      <div className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="w-full text-left">
            <TableHeader className="bg-slate-50/50 border-y border-slate-100">
              <TableRow>
                <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Order Info</TableHead>
                <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Customer</TableHead>
                <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Items</TableHead>
                <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Amount</TableHead>
                <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Payment</TableHead>
                <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Due Date</TableHead>
                <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</TableHead>
                <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-50">
              {error ? (
                <TableRow>
                  <TableCell colSpan={8} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-400">
                        <AlertTriangle className="h-8 w-8" />
                      </div>
                      <p className="text-red-600 font-semibold">Failed to load sales</p>
                      <p className="text-slate-400 text-sm">{error}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 rounded-full"
                        onClick={fetchSales}
                      >
                        Retry
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={8} className="px-6 py-4"><div className="h-12 w-full bg-slate-100 animate-pulse rounded-xl" /></TableCell>
                  </TableRow>
                ))
              ) : filteredSales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="px-6 py-20 text-center text-slate-400">
                    <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-5" />
                    <p className="text-lg font-medium">No sales orders found</p>
                    <Button variant="link" onClick={() => router.push("/sales/new")} className="text-indigo-600 font-bold mt-2">
                      Create your first sale
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSales.map((sale) => {
                  const totalPaid = sale.payments.reduce((acc, p) => acc + Number(p.amount), 0);
                  const totalAmount = calculateTotal(sale.sale_items);
                  const outstanding = totalAmount - totalPaid;

                  return (
                    <TableRow
                      key={sale.id}
                      className={`group hover:bg-slate-50/50 transition-colors cursor-pointer ${
                        sale.due_date && new Date(sale.due_date) < new Date() && sale.payment_status !== "PAID"
                          ? "bg-red-50/50 hover:bg-red-100/50"
                          : ""
                      }`}
                      onClick={() => router.push(`/sales/${sale.id}`)}
                    >
                      <TableCell className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="font-mono text-sm text-slate-500">{sale.sale_number}</span>
                          <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Calendar className="h-3 w-3" />
                            {new Date(sale.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-700">{sale.customer.full_name}</span>
                          <span className="text-xs text-slate-500">{sale.customer.phone}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-5 text-center">
                        <Badge variant="secondary" className="bg-slate-100 text-slate-600 rounded-lg">
                          {sale.sale_items.length} Products
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-5">
                        <span className="font-black text-slate-900">
                          {new Intl.NumberFormat("en-NG", {
                            style: "currency",
                            currency: "NGN",
                          }).format(totalAmount)}
                        </span>
                      </TableCell>
                      <TableCell className="px-6 py-5">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-bold text-slate-700">
                            {new Intl.NumberFormat("en-NG", {
                              style: "currency",
                              currency: "NGN",
                            }).format(totalPaid)}
                          </span>
                          {outstanding > 0 && (
                            <span className="text-xs text-amber-600 font-medium">
                              {new Intl.NumberFormat("en-NG", {
                                style: "currency",
                                currency: "NGN",
                              }).format(outstanding)} outstanding
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-5">
                        {sale.due_date ? (
                          <div className={`flex flex-col gap-1 ${
                            new Date(sale.due_date) < new Date() && sale.payment_status !== "PAID"
                              ? "text-red-600"
                              : "text-slate-500"
                          }`}>
                            <span className="text-xs font-medium">
                              {new Date(sale.due_date).toLocaleDateString()}
                            </span>
                            {new Date(sale.due_date) < new Date() && sale.payment_status !== "PAID" && (
                              <span className="text-[10px] font-bold text-red-500">OVERDUE</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </TableCell>
                      <TableCell className="px-6 py-5">
                        {getPaymentStatusBadge(sale.payment_status)}
                      </TableCell>
                      <TableCell className="px-6 py-5 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-xl" onClick={(e) => e.stopPropagation()}>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-2xl border-slate-200">
                            <DropdownMenuItem
                              onClick={async () => {
                                try {
                                  const res = await fetch(`/api/receipt?saleId=${sale.id}`)
                                  if (!res.ok) throw new Error("Failed to fetch receipt")

                                  const blob = await res.blob()
                                  const url = URL.createObjectURL(blob)
                                  const iframe = document.createElement('iframe')
                                  iframe.src = url
                                  iframe.style.display = 'none'
                                  document.body.appendChild(iframe)
                                  iframe.onload = () => {
                                    iframe.contentWindow?.print()
                                  }
                                } catch (error) {
                                  console.error("Error printing receipt:", error)
                                  toast.error("Failed to print receipt")
                                }
                              }}
                              className="py-2.5 rounded-xl flex items-center gap-2 cursor-pointer">
                              <Printer className="h-4 w-4 text-slate-400" />
                              Print Receipt
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={async () => {
                                try {
                                  const res = await fetch(`/api/receipt?saleId=${sale.id}`)
                                  if (!res.ok) throw new Error("Failed to fetch receipt")

                                  const blob = await res.blob()
                                  const url = window.URL.createObjectURL(blob)
                                  const a = document.createElement('a')
                                  a.href = url
                                  a.download = `receipt-${sale.sale_number}.pdf`
                                  document.body.appendChild(a)
                                  a.click()
                                  window.URL.revokeObjectURL(url)
                                  document.body.removeChild(a)
                                } catch (error) {
                                  console.error("Error downloading receipt:", error)
                                  toast.error("Failed to download receipt")
                                }
                              }}
                              className="py-2.5 rounded-xl flex items-center gap-2 cursor-pointer">
                              <Download className="h-4 w-4 text-slate-400" />
                              Download Receipt
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
