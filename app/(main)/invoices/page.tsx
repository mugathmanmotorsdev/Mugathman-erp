"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  FileText,
  MoreVertical,
  Download,
  Printer,
  DollarSign,
  Clock,
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
import { Invoice } from "@/types/invoice";
import { useFormatCurrency } from "@/hooks/use-formatcurrency";

export default function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState("ALL");

  const fetchInvoices = async () => {
    try {
      const res = await fetch("/api/invoices");
      if (res.ok) {
        const data = await res.json();
        setInvoices(data);
      } else {
        toast.error("Failed to load invoices");
      }
    } catch (error) {
      console.error("Error fetching invoices", error);
      toast.error("Internal server error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const calculateTotal = (items: Invoice["items"]) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return items.reduce((acc: number, item: any) => acc + item.quantity * Number(item.unit_price), 0);
  };

  const filteredInvoices = invoices.filter(
    (inv) =>
      (invoiceStatusFilter === "ALL" || inv.status === invoiceStatusFilter) &&
      (inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.customer.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.customer.phone.includes(searchQuery)),
  );

  const totalInvoiceValue = invoices.reduce(
    (acc, inv) => acc + calculateTotal(inv.items),
    0
  );
  const { formattedAmountWithUnit: formattedTotalValue } = useFormatCurrency(totalInvoiceValue);

  const pendingCount = invoices.filter((inv) => inv.status === "PENDING").length;

  const handleDownloadPDF = async (invoiceId: string, invoiceNumber: string) => {
    try {
      const res = await fetch(`/api/invoice-pdf?invoiceId=${invoiceId}`);
      if (!res.ok) throw new Error("Failed to fetch PDF");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading invoice PDF:", error);
      toast.error("Failed to download invoice PDF");
    }
  };

  const handlePrintPDF = async (invoiceId: string) => {
    try {
      const res = await fetch(`/api/invoice-pdf?invoiceId=${invoiceId}`);
      if (!res.ok) throw new Error("Failed to fetch PDF");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const iframe = document.createElement("iframe");
      iframe.src = url;
      iframe.style.display = "none";
      document.body.appendChild(iframe);
      iframe.onload = () => {
        iframe.contentWindow?.print();
      };
    } catch (error) {
      console.error("Error printing invoice:", error);
      toast.error("Failed to print invoice");
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      PENDING: {
        bg: "bg-amber-50",
        text: "text-amber-600",
        border: "border-amber-100",
        label: "Pending",
      },
      PAID: {
        bg: "bg-emerald-50",
        text: "text-emerald-600",
        border: "border-emerald-100",
        label: "Paid",
      },
      CANCELLED: {
        bg: "bg-red-50",
        text: "text-red-600",
        border: "border-red-100",
        label: "Cancelled",
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
          title="Invoices"
          description="Generate and manage invoices for your clients."
        />
        <div className="flex items-center gap-3">
          <Button
            onClick={() => router.push("/invoices/new")}
            className="bg-[#150150] hover:bg-[#150150]/90 text-white px-6 h-12 rounded-2xl font-bold shadow-lg shadow-indigo-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Invoice
          </Button>
        </div>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Invoices"
          stat={invoices.length}
          icon={<FileText className="h-6 w-6" />}
          iconBg="bg-indigo-50"
        />
        <StatCard
          title="Total Value"
          stat={formattedTotalValue}
          icon={<DollarSign className="h-6 w-6" />}
          iconBg="bg-emerald-50"
        />
        <StatCard
          title="Pending"
          stat={pendingCount}
          icon={<Clock className="h-6 w-6" />}
          iconBg="bg-amber-50"
        />
      </div>

      {/* Search & Filter */}
      <FilterBar>
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by invoice #, customer name or phone..."
        />
        <FilterSelect
          options={[
            { label: "All Status", value: "ALL" },
            { label: "Pending", value: "PENDING" },
            { label: "Paid", value: "PAID" },
            { label: "Cancelled", value: "CANCELLED" },
          ]}
          value={invoiceStatusFilter}
          onValueChange={setInvoiceStatusFilter}
          triggerClassName="w-[170px] h-12 border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-white shadow-none"
          placeholder="Invoice Status"
        />
      </FilterBar>

      {/* Invoices Table */}
      <div className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="w-full text-left">
            <TableHeader className="bg-slate-50/50 border-y border-slate-100">
              <TableRow>
                <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Invoice</TableHead>
                <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Customer</TableHead>
                <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Date</TableHead>
                <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Items</TableHead>
                <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Amount</TableHead>
                <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</TableHead>
                <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={7} className="px-6 py-4"><div className="h-12 w-full bg-slate-100 animate-pulse rounded-xl" /></TableCell>
                  </TableRow>
                ))
              ) : filteredInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="px-6 py-20 text-center text-slate-400">
                    <FileText className="h-16 w-16 mx-auto mb-4 opacity-5" />
                    <p className="text-lg font-medium">No invoices found</p>
                    <Button variant="link" onClick={() => router.push("/invoices/new")} className="text-indigo-600 font-bold mt-2">
                      Create your first invoice
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id} className="group hover:bg-slate-50/50 transition-colors">
                    <TableCell className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="font-mono text-sm text-slate-500">{invoice.invoice_number}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-700">{invoice.customer.full_name}</span>
                        <span className="text-xs text-slate-500">{invoice.customer.phone}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-5">
                      <span className="text-sm font-medium text-slate-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(invoice.created_at).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-5 text-center">
                      <Badge variant="secondary" className="bg-slate-100 text-slate-600 rounded-lg">
                        {invoice.items.length} Items
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-5">
                      <span className="font-black text-slate-900">
                        {new Intl.NumberFormat("en-NG", {
                          style: "currency",
                          currency: "NGN",
                        }).format(calculateTotal(invoice.items))}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-5">
                      {getStatusBadge(invoice.status)}
                    </TableCell>
                    <TableCell className="px-6 py-5 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="rounded-xl">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-2xl border-slate-200">
                          <DropdownMenuItem
                            onClick={() => handlePrintPDF(invoice.id)}
                            className="py-2.5 rounded-xl flex items-center gap-2 cursor-pointer"
                          >
                            <Printer className="h-4 w-4 text-slate-400" />
                            Print Invoice
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDownloadPDF(invoice.id, invoice.invoice_number)}
                            className="py-2.5 rounded-xl flex items-center gap-2 cursor-pointer"
                          >
                            <Download className="h-4 w-4 text-slate-400" />
                            Download PDF
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
