"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  FileText,
  ShoppingCart,
  Package,
  UserCheck,
  Download,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  ArrowLeftRight,
  RefreshCw,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import PageHeading from "@/components/PageHeading";
import StatCard from "@/components/StatCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

type DatePreset = "7" | "30" | "90" | "custom";

interface ReportSummary {
  totalSales?: number;
  totalRevenue?: number;
  totalPaid?: number;
  totalOutstanding?: number;
  paidCount?: number;
  partiallyPaidCount?: number;
  pendingCount?: number;
  totalMovements?: number;
  totalIn?: number;
  totalOut?: number;
  netStock?: number;
  totalLeads?: number;
  newCount?: number;
  qualifiedCount?: number;
  disqualifiedCount?: number;
}

interface ReportData {
  summary: ReportSummary;
  items: any[];
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<"sales" | "stock" | "leads">("sales");
  const [datePreset, setDatePreset] = useState<DatePreset>("30");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ReportData | null>(null);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (datePreset === "custom") {
        if (dateFrom) params.set("dateFrom", dateFrom);
        if (dateTo) params.set("dateTo", dateTo);
      } else {
        const days = parseInt(datePreset);
        const to = new Date();
        const from = new Date();
        from.setDate(from.getDate() - days);
        params.set("dateFrom", from.toISOString().split("T")[0]);
        params.set("dateTo", to.toISOString().split("T")[0]);
      }

      const res = await fetch(`/api/reports/${activeTab}?${params.toString()}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error("Error fetching report:", error);
      toast.error("Failed to load report data");
    } finally {
      setLoading(false);
    }
  }, [activeTab, datePreset, dateFrom, dateTo]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleDownloadPDF = async () => {
    try {
      const params = new URLSearchParams();
      if (datePreset === "custom") {
        if (dateFrom) params.set("dateFrom", dateFrom);
        if (dateTo) params.set("dateTo", dateTo);
      } else {
        const days = parseInt(datePreset);
        const to = new Date();
        const from = new Date();
        from.setDate(from.getDate() - days);
        params.set("dateFrom", from.toISOString().split("T")[0]);
        params.set("dateTo", to.toISOString().split("T")[0]);
      }

      const res = await fetch(`/api/reports/${activeTab}/pdf?${params.toString()}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to generate PDF");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${activeTab}-report-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("PDF downloaded successfully");
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast.error("Failed to download PDF");
    }
  };

  const presetButtons = [
    { label: "Last 7 Days", value: "7" },
    { label: "Last 30 Days", value: "30" },
    { label: "Last 90 Days", value: "90" },
    { label: "Custom", value: "custom" },
  ];

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(amount);

  const formatDateInput = (isoString: string) => {
    if (!isoString) return "";
    return isoString.split("T")[0];
  };

  const renderSummaryCards = () => {
    const s = data?.summary;
    if (!s) return null;

    switch (activeTab) {
      case "sales":
        return (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <StatCard title="Total Sales" stat={s.totalSales || 0} icon={<ShoppingCart className="h-6 w-6" />} iconBg="bg-indigo-50" />
            <StatCard title="Total Revenue" stat={formatCurrency(s.totalRevenue || 0)} icon={<DollarSign className="h-6 w-6" />} iconBg="bg-emerald-50" />
            <StatCard title="Total Paid" stat={formatCurrency(s.totalPaid || 0)} icon={<CheckCircle className="h-6 w-6" />} iconBg="bg-emerald-50" />
            <StatCard title="Outstanding" stat={formatCurrency(s.totalOutstanding || 0)} icon={<AlertTriangle className="h-6 w-6" />} iconBg="bg-amber-50" />
            <StatCard title="Paid Orders" stat={`${s.paidCount || 0} / ${s.totalSales || 0}`} icon={<Clock className="h-6 w-6" />} iconBg="bg-slate-50" />
          </div>
        );
      case "stock":
        return (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard title="Total Movements" stat={s.totalMovements || 0} icon={<ArrowLeftRight className="h-6 w-6" />} iconBg="bg-indigo-50" />
            <StatCard title="Total Stock In" stat={`${s.totalIn || 0} units`} icon={<Package className="h-6 w-6" />} iconBg="bg-emerald-50" />
            <StatCard title="Total Stock Out" stat={`${s.totalOut || 0} units`} icon={<Package className="h-6 w-6" />} iconBg="bg-rose-50" />
            <StatCard title="Net Stock" stat={`${s.netStock || 0} units`} icon={<DollarSign className="h-6 w-6" />} iconBg="bg-slate-50" />
          </div>
        );
      case "leads":
        return (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard title="Total Leads" stat={s.totalLeads || 0} icon={<UserCheck className="h-6 w-6" />} iconBg="bg-indigo-50" />
            <StatCard title="New" stat={s.newCount || 0} icon={<Clock className="h-6 w-6" />} iconBg="bg-slate-100" />
            <StatCard title="Qualified" stat={s.qualifiedCount || 0} icon={<CheckCircle className="h-6 w-6" />} iconBg="bg-emerald-50" />
            <StatCard title="Disqualified" stat={s.disqualifiedCount || 0} icon={<AlertTriangle className="h-6 w-6" />} iconBg="bg-rose-50" />
          </div>
        );
    }
  };

  const renderItemsTable = () => {
    const items = data?.items || [];

    if (loading) {
      return (
        <div className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <TableHead key={i} className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                      <Skeleton className="h-4 w-20" />
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <TableCell key={j} className="px-6 py-4">
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      );
    }

    if (!data || items.length === 0) {
      return (
        <div className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={5} className="px-6 py-20 text-center text-slate-400">
                    <FileText className="h-16 w-16 mx-auto mb-4 opacity-10" />
                    <p className="text-lg font-medium">No data found</p>
                    <p className="text-sm text-slate-400 mt-1">Try adjusting the date range or filters</p>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case "sales":
        return (
          <div className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <Table className="w-full text-left">
                <TableHeader className="bg-slate-50/50 border-y border-slate-100">
                  <TableRow>
                    <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Order</TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Customer</TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Items</TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Amount</TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Paid</TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Outstanding</TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-50">
                  {items.map((sale: any) => {
                    const totalAmount = sale.sale_items.reduce((acc: number, item: any) => acc + Number(item.unit_price) * item.quantity, 0);
                    const totalPaid = sale.payments.reduce((acc: number, p: any) => acc + Number(p.amount), 0);
                    const outstanding = totalAmount - totalPaid;

                    return (
                      <TableRow key={sale.id}>
                        <TableCell className="px-6 py-4">
                          <span className="font-mono text-sm text-slate-500">{sale.sale_number}</span>
                          <span className="text-xs text-slate-400 block mt-0.5">{new Date(sale.created_at).toLocaleDateString()}</span>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <span className="font-bold text-slate-700">{sale.customer.full_name}</span>
                          <span className="text-xs text-slate-500 block">{sale.customer.phone}</span>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-center">
                          <Badge variant="secondary" className="bg-slate-100 text-slate-600 rounded-lg">{sale.sale_items.length}</Badge>
                        </TableCell>
                        <TableCell className="px-6 py-4 font-black text-slate-900">{formatCurrency(totalAmount)}</TableCell>
                        <TableCell className="px-6 py-4 text-emerald-600 font-bold">{formatCurrency(totalPaid)}</TableCell>
                        <TableCell className="px-6 py-4">
                          {outstanding > 0 ? (
                            <span className="text-amber-600 font-medium">{formatCurrency(outstanding)}</span>
                          ) : (
                            <span className="text-slate-400">&mdash;</span>
                          )}
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Badge
                            variant="outline"
                            className={`font-bold ${
                              sale.payment_status === "PAID"
                                ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                : sale.payment_status === "PARTIALLY_PAID"
                                ? "bg-amber-50 text-amber-600 border-amber-200"
                                : "bg-slate-100 text-slate-600 border-slate-200"
                            }`}
                          >
                            {sale.payment_status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        );

      case "stock":
        return (
          <div className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <Table className="w-full text-left">
                <TableHeader className="bg-slate-50/50 border-y border-slate-100">
                  <TableRow>
                    <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Product</TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">VIN / Vehicle</TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Type</TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Qty</TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Reason</TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-50">
                  {items.map((m: any) => (
                    <TableRow key={m.id}>
                      <TableCell className="px-6 py-4">
                        <span className="font-semibold text-slate-900">{m.product.name}</span>
                        <span className="text-xs text-slate-500 block font-mono">{m.product.sku}</span>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        {m.vehicle ? (
                          <span className="font-mono text-sm">{m.vehicle.vin}</span>
                        ) : (
                          <span className="text-slate-400 italic">&mdash;</span>
                        )}
                        {m.vehicle?.color && <span className="text-xs text-slate-500 block">{m.vehicle.color}</span>}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-center">
                        <Badge
                          variant="outline"
                          className={`font-bold ${m.type === "IN" ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-rose-50 text-rose-600 border-rose-200"}`}
                        >
                          {m.type === "IN" ? "Stock In" : "Stock Out"}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-center font-bold">
                        {m.type === "IN" ? "+" : "-"}
                        {Math.abs(m.quantity)}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-slate-600">{m.reason}</TableCell>
                      <TableCell className="px-6 py-4 text-slate-500 text-sm">{new Date(m.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        );

      case "leads":
        return (
          <div className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <Table className="w-full text-left">
                <TableHeader className="bg-slate-50/50 border-y border-slate-100">
                  <TableRow>
                    <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Lead</TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Organization</TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Interest</TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Status</TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-50">
                  {items.map((lead: any) => (
                    <TableRow key={lead.id}>
                      <TableCell className="px-6 py-4">
                        <span className="font-bold text-slate-700">{lead.full_name}</span>
                        <span className="text-xs text-slate-500 block">{lead.email}</span>
                        <span className="text-xs text-slate-500">{lead.phone}</span>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        {lead.organization ? (
                          <span className="text-slate-600">{lead.organization}</span>
                        ) : (
                          <span className="text-slate-400 italic">&mdash;</span>
                        )}
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        {lead.product_of_interest ? (
                          <span className="text-slate-600">{lead.product_of_interest}</span>
                        ) : (
                          <span className="text-slate-400 italic">&mdash;</span>
                        )}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-center">
                        <Badge
                          variant="outline"
                          className={`font-bold ${
                            lead.status === "NEW"
                              ? "bg-slate-100 text-slate-600 border-slate-200"
                              : lead.status === "QUALIFIED"
                              ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                              : "bg-rose-50 text-rose-600 border-rose-200"
                          }`}
                        >
                          {lead.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-slate-500 text-sm">{new Date(lead.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-[#EFF3F4] min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeading
          title="Reports"
          description="Export and download PDF reports for sales, stock movements, and leads."
        />
        <div className="flex items-center gap-3">
          <Button
            onClick={fetchReport}
            variant="outline"
            className="h-10 px-4 rounded-xl border-slate-200 font-bold text-sm text-slate-600"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={handleDownloadPDF}
            className="bg-[#150150] hover:bg-[#150150]/90 text-white px-6 h-10 rounded-xl font-bold shadow-lg shadow-indigo-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-wrap items-center gap-3">
        <span className="text-sm font-bold text-slate-500 mr-2">
          <Calendar className="h-4 w-4 inline mr-1" />
          Date Range:
        </span>
        {presetButtons.map((preset) => (
          <Button
            key={preset.value}
            variant={datePreset === preset.value ? "default" : "outline"}
            size="sm"
            className={`h-9 px-4 rounded-xl text-xs font-bold ${
              datePreset === preset.value
                ? "bg-[#150150] text-white border-[#150150]"
                : "border-slate-200 text-slate-600"
            }`}
            onClick={() => {
              setDatePreset(preset.value);
              if (preset.value !== "custom") {
                setDateFrom("");
                setDateTo("");
              }
            }}
          >
            {preset.label}
          </Button>
        ))}
        {datePreset === "custom" && (
          <div className="flex items-center gap-2 ml-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-9 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white focus:ring-2 focus:ring-indigo-100 outline-none"
            />
            <span className="text-slate-400 text-xs">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-9 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white focus:ring-2 focus:ring-indigo-100 outline-none"
            />
            {dateFrom && dateTo && (
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 rounded-xl"
                onClick={() => {
                  setDateFrom("");
                  setDateTo("");
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Module Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-0">
        {[
          { key: "sales", label: "Sales", icon: ShoppingCart },
          { key: "stock", label: "Stock Movements", icon: ArrowLeftRight },
          { key: "leads", label: "Leads", icon: UserCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.key}
              variant={activeTab === tab.key ? "default" : "ghost"}
              className={`rounded-xl rounded-b-none border-b-2 ${
                activeTab === tab.key
                  ? "bg-[#150150] text-white border-[#150150]"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
              onClick={() => setActiveTab(tab.key as any)}
            >
              <Icon className="h-4 w-4 mr-2" />
              {tab.label}
            </Button>
          );
        })}
      </div>

      {/* Summary Cards */}
      {renderSummaryCards()}

      {/* Items Table */}
      {renderItemsTable()}
    </div>
  );
}
