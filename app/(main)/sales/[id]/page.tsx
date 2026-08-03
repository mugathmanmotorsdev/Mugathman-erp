"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Printer,
  Download,
  ShoppingCart,
  User,
  Calendar,
  Clock,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  Plus,
  CreditCard,
  Banknote,
  Building2,
  Smartphone,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Label } from "@/components/ui/label";
import PageHeading from "@/components/PageHeading";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sale } from "@/types/sale";
import { useFormatCurrency } from "@/hooks/use-formatcurrency";

const methodIcons = {
  CASH: <Banknote className="h-4 w-4" />,
  BANK_TRANSFER: <Building2 className="h-4 w-4" />,
  CHEQUE: <FileText className="h-4 w-4" />,
  MOBILE_MONEY: <Smartphone className="h-4 w-4" />,
};

const methodLabels = {
  CASH: "Cash",
  BANK_TRANSFER: "Bank Transfer",
  CHEQUE: "Cheque",
  MOBILE_MONEY: "Mobile Money",
};

function getPaymentStatusBadge(status: string) {
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
}

export default function SaleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [submittingPayment, setSubmittingPayment] = useState(false);

  useEffect(() => {
    const fetchSale = async () => {
      try {
        const { id } = await params;
        const res = await fetch(`/api/sales/${id}`);
        if (res.ok) {
          const data = await res.json();
          setSale(data);
        } else {
          toast.error("Failed to load sale");
        }
      } catch (error) {
        console.error("Error fetching sale:", error);
        toast.error("Internal server error");
      } finally {
        setLoading(false);
      }
    };

    fetchSale();
  }, [params]);

  const handleRecordPayment = async () => {
    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }

    setSubmittingPayment(true);
    try {
      const { id } = await params;
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sale_id: id,
          amount,
          method: paymentMethod,
          notes: paymentNotes || null,
        }),
      });

      if (res.ok) {
        toast.success("Payment recorded successfully");
        setPaymentAmount("");
        setPaymentNotes("");
        // Refresh sale data
        const saleRes = await fetch(`/api/sales/${id}`);
        if (saleRes.ok) {
          setSale(await saleRes.json());
        }
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to record payment");
      }
    } catch (error) {
      console.error("Error recording payment:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setSubmittingPayment(false);
    }
  };

  const calculateTotal = (items: Sale["sale_items"]) => {
    return items.reduce((acc, item) => acc + item.quantity * Number(item.unit_price), 0);
  };

  const totalAmount = sale ? calculateTotal(sale.sale_items) : 0;
  const totalPaid = sale ? sale.payments.reduce((acc, p) => acc + Number(p.amount), 0) : 0;
  const outstanding = totalAmount - totalPaid;
  const { formattedAmountWithUnit: formattedTotal } = useFormatCurrency(totalAmount);
  const { formattedAmountWithUnit: formattedPaid } = useFormatCurrency(totalPaid);
  const { formattedAmountWithUnit: formattedOutstanding } = useFormatCurrency(outstanding);

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-12 w-1/4 rounded-2xl" />
        <div className="grid grid-cols-3 gap-6">
          <Skeleton className="h-[400px] col-span-2 rounded-3xl" />
          <Skeleton className="h-[400px] rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="flex flex-col gap-6 p-6 bg-[#EFF3F4] min-h-screen">
        <div className="text-center py-20">
          <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-5" />
          <p className="text-lg font-medium text-slate-400">Sale not found</p>
          <Button variant="link" onClick={() => router.push("/sales")} className="text-indigo-600 font-bold mt-2">
            Back to Sales
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 bg-[#EFF3F4] min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-white border border-slate-200 shadow-sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {sale.sale_number}
            </h1>
            <p className="text-sm text-slate-500">
              Created {new Date(sale.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="rounded-xl border-slate-200 font-bold"
            onClick={async () => {
              try {
                const res = await fetch(`/api/receipt?saleId=${sale.id}`);
                if (!res.ok) throw new Error("Failed to fetch receipt");
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const iframe = document.createElement("iframe");
                iframe.src = url;
                iframe.style.display = "none";
                document.body.appendChild(iframe);
                iframe.onload = () => iframe.contentWindow?.print();
              } catch (error) {
                console.error("Error printing receipt:", error);
                toast.error("Failed to print receipt");
              }
            }}
          >
            <Printer className="h-4 w-4 mr-2" />
            Print Receipt
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-[#150150] hover:bg-[#150150]/90 text-white rounded-xl font-bold">
                <Plus className="h-4 w-4 mr-2" />
                Record Payment
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader>
                <DialogTitle>Record Payment</DialogTitle>
                <DialogDescription>
                  Record a payment against this sale. Outstanding balance:{" "}
                  <span className="font-bold">{formattedOutstanding}</span>
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={outstanding}
                    placeholder="0.00"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="h-12 border-slate-200 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Method</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger className="h-12 border-slate-200 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="CASH">Cash</SelectItem>
                      <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                      <SelectItem value="CHEQUE">Cheque</SelectItem>
                      <SelectItem value="MOBILE_MONEY">Mobile Money</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Notes (Optional)</Label>
                  <Input
                    placeholder="Payment reference or notes"
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    className="h-12 border-slate-200 rounded-xl"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => {
                    setPaymentAmount("");
                    setPaymentNotes("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-[#150150] hover:bg-[#150150]/90 text-white rounded-xl"
                  onClick={handleRecordPayment}
                  disabled={submittingPayment}
                >
                  {submittingPayment ? "Recording..." : "Record Payment"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer & Status Card */}
          <Card className="rounded-2xl border-none shadow-xl shadow-slate-200/50 bg-white overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100 flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">Customer</CardTitle>
                </div>
              </div>
              <div className="flex gap-3 items-center">
                {getPaymentStatusBadge(sale.payment_status)}
                <Badge
                  className={`rounded-lg px-3 py-1 font-bold ${sale.status === "COMPLETED"
                    ? "bg-emerald-50 text-emerald-600 border-none"
                    : sale.status === "CANCELLED"
                    ? "bg-red-50 text-red-600 border-none"
                    : "bg-slate-100 text-slate-500 border-none"
                    }`}
                >
                  {sale.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Customer</p>
                  <p className="font-semibold text-slate-800">{sale.customer.full_name}</p>
                  <p className="text-sm text-slate-500">{sale.customer.phone}</p>
                  {sale.customer.email && (
                    <p className="text-sm text-slate-500">{sale.customer.email}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Sale Details</p>
                  <p className="text-sm text-slate-700">
                    <span className="font-mono">{sale.sale_number}</span>
                  </p>
                  <p className="text-sm text-slate-500 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(sale.created_at).toLocaleDateString()}
                  </p>
                  {sale.due_date && (
                    <p className={`text-sm flex items-center gap-1 ${
                      new Date(sale.due_date) < new Date() && sale.payment_status !== "PAID"
                        ? "text-red-600 font-bold"
                        : "text-slate-500"
                    }`}>
                      <Clock className="h-3 w-3" />
                      Due: {new Date(sale.due_date).toLocaleDateString()}
                      {new Date(sale.due_date) < new Date() && sale.payment_status !== "PAID" && (
                        <span className="text-red-500 text-xs ml-1">OVERDUE</span>
                      )}
                    </p>
                  )}
                  <p className="text-sm text-slate-500">
                    By {sale.user?.full_name || "Unknown"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Line Items Card */}
          <Card className="rounded-2xl border-none shadow-xl shadow-slate-200/50 bg-white overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100 flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <ShoppingCart className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">Line Items</CardTitle>
                </div>
              </div>
              <span className="text-sm font-bold text-slate-500">
                {sale.sale_items.length} item(s)
              </span>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table className="w-full">
                  <TableHeader className="bg-slate-50/50 border-b border-slate-100">
                    <TableRow>
                      <TableHead className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Product</TableHead>
                      <TableHead className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest w-24">Qty</TableHead>
                      <TableHead className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Price</TableHead>
                      <TableHead className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-widest">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-slate-100">
                    {sale.sale_items.map((item) => (
                      <TableRow key={item.id} className="group hover:bg-slate-50/30 transition-colors">
                        <TableCell className="px-6 py-4">
                          <span className="font-semibold text-slate-800">{item.product?.name}</span>
                          {item.vehicle && (
                            <span className="block text-xs text-slate-500 font-mono">VIN: {item.vehicle.vin}</span>
                          )}
                        </TableCell>
                        <TableCell className="px-6 py-4 text-center font-bold">{item.quantity}</TableCell>
                        <TableCell className="px-6 py-4">
                          {new Intl.NumberFormat("en-NG", {
                            style: "currency",
                            currency: "NGN",
                          }).format(Number(item.unit_price))}
                        </TableCell>
                        <TableCell className="px-6 py-4 text-right font-black">
                          {new Intl.NumberFormat("en-NG", {
                            style: "currency",
                            currency: "NGN",
                          }).format(item.quantity * Number(item.unit_price))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Payment History Card */}
          <Card className="rounded-2xl border-none shadow-xl shadow-slate-200/50 bg-white overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100 flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">Payment History</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {sale.payments.length === 0 ? (
                <div className="px-6 py-12 text-center text-slate-400">
                  <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-10" />
                  <p className="font-medium">No payments recorded yet</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {sale.payments.map((payment) => (
                    <div key={payment.id} className="px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                          {methodIcons[payment.method as keyof typeof methodIcons] || <CreditCard className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">
                            {methodLabels[payment.method as keyof typeof methodLabels] || payment.method}
                          </p>
                          {payment.notes && (
                            <p className="text-xs text-slate-500">{payment.notes}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-slate-900">
                          {new Intl.NumberFormat("en-NG", {
                            style: "currency",
                            currency: "NGN",
                          }).format(Number(payment.amount))}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(payment.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Summary */}
        <div className="space-y-6">
          <Card className="border-none shadow-2xl shadow-indigo-200/50 bg-[#150150] text-white rounded-2xl overflow-hidden sticky top-6">
            <CardHeader className="pb-8 pt-12 px-10">
              <div className="flex items-center gap-2 text-indigo-200 text-[10px] font-black uppercase tracking-[0.2em]">
                <DollarSign className="h-4 w-4" />
                Payment Summary
              </div>
              <div className="mt-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-indigo-200/60 text-sm font-bold uppercase tracking-widest text-[10px]">Total Amount</span>
                  <span className="font-black text-xl">{formattedTotal}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-indigo-200/60 text-sm font-bold uppercase tracking-widest text-[10px]">Total Paid</span>
                  <span className="font-black text-xl text-emerald-400">{formattedPaid}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-indigo-200/60 text-sm font-bold uppercase tracking-widest text-[10px]">Outstanding</span>
                  <span className={`font-black text-xl ${outstanding > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                    {formattedOutstanding}
                  </span>
                </div>
              </div>

              {outstanding > 0 && (
                <div className="mt-6 bg-white/5 rounded-3xl p-4 border border-white/5">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-widest">
                    <AlertTriangle className="h-4 w-4" />
                    Payment Due
                  </div>
                  <p className="text-indigo-200/60 text-xs mt-2 leading-relaxed">
                    This sale still has an outstanding balance of {formattedOutstanding}.
                    Record a payment to update the status.
                  </p>
                </div>
              )}

              {outstanding === 0 && totalPaid > 0 && (
                <div className="mt-6 bg-emerald-500/10 rounded-3xl p-4 border border-emerald-500/20">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-widest">
                    <CheckCircle className="h-4 w-4" />
                    Fully Paid
                  </div>
                  <p className="text-indigo-200/60 text-xs mt-2 leading-relaxed">
                    All payments have been received for this sale.
                  </p>
                </div>
              )}
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}
