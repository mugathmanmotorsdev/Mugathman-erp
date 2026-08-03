"use client";

import React, { useCallback, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  UserCheck,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import PageHeading from "@/components/PageHeading";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";

interface Lead {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  organization: string | null;
  product_of_interest: string | null;
  message: string | null;
  status: "NEW" | "QUALIFIED" | "DISQUALIFIED";
  meta_conversion_id: string | null;
  created_at: string;
  updated_at: string;
}

const statusColors = {
  NEW: "bg-slate-100 text-slate-600 border-slate-200",
  QUALIFIED: "bg-emerald-50 text-emerald-600 border-emerald-200",
  DISQUALIFIED: "bg-rose-50 text-rose-600 border-rose-200",
};

const statusIcons = {
  NEW: Clock,
  QUALIFIED: CheckCircle,
  DISQUALIFIED: XCircle,
};

export default function LeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.set("status", statusFilter);

      const res = await fetch(`/api/leads?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLeads(data);
      } else {
        toast.error("Failed to load leads");
      }
    } catch (error) {
      console.error("Error fetching leads:", error);
      toast.error("Internal server error");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const filteredLeads = leads.filter(
    (lead) =>
      lead.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery) ||
      (lead.organization &&
        lead.organization.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleQualify = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/leads/${id}/qualify`, {
        method: "POST",
      });
      if (res.ok) {
        toast.success("Lead marked as qualified — Meta conversion queued");
        fetchLeads();
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to qualify lead");
      }
    } catch (error) {
      console.error("Error qualifying lead:", error);
      toast.error("Failed to qualify lead");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDisqualify = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "DISQUALIFIED" }),
      });
      if (res.ok) {
        toast.success("Lead disqualified");
        fetchLeads();
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to update lead");
      }
    } catch (error) {
      console.error("Error disqualifying lead:", error);
      toast.error("Failed to disqualify lead");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-[#EFF3F4] min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeading
          title="Leads"
          description="Manage and qualify visitor inquiries from the website."
        />
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="h-12 rounded-2xl border-slate-200 font-bold text-slate-600"
            onClick={fetchLeads}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            New Leads
          </p>
          <h3 className="text-3xl font-black text-slate-900 mt-1">
            {leads.filter((l) => l.status === "NEW").length}
          </h3>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Qualified
          </p>
          <h3 className="text-3xl font-black text-emerald-600 mt-1">
            {leads.filter((l) => l.status === "QUALIFIED").length}
          </h3>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Disqualified
          </p>
          <h3 className="text-3xl font-black text-rose-600 mt-1">
            {leads.filter((l) => l.status === "DISQUALIFIED").length}
          </h3>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by name, email, phone, or organization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 pl-12 bg-slate-50/50 border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <div className="flex gap-2">
            {["ALL", "NEW", "QUALIFIED", "DISQUALIFIED"].map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                className={`h-12 px-4 rounded-xl font-bold text-sm ${
                  statusFilter === status
                    ? "bg-[#150150] hover:bg-[#150150]/90 text-white"
                    : "border-slate-200 text-slate-600"
                }`}
                onClick={() => setStatusFilter(status)}
              >
                {status}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="w-full text-left">
            <TableHeader className="bg-slate-50/50 border-b border-slate-100">
              <TableRow>
                <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Lead
                </TableHead>
                <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Organization
                </TableHead>
                <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Interest
                </TableHead>
                <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">
                  Status
                </TableHead>
                <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={5} className="px-6 py-4">
                      <Skeleton className="h-12 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredLeads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="px-6 py-20 text-center text-slate-400">
                    <UserCheck className="h-16 w-16 mx-auto mb-4 opacity-10" />
                    <p className="text-lg font-medium">No leads found</p>
                    <p className="text-sm text-slate-400 mt-1">
                      Visitor inquiries will appear here.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredLeads.map((lead) => {
                  const StatusIcon = statusIcons[lead.status];
                  return (
                    <TableRow
                      key={lead.id}
                      className="group hover:bg-slate-50/50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/leads/${lead.id}`)}
                    >
                      <TableCell className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-700 group-hover:text-slate-900">
                            {lead.full_name}
                          </span>
                          <span className="text-xs text-slate-500">
                            {lead.email} · {lead.phone}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        {lead.organization ? (
                          <span className="text-slate-600">{lead.organization}</span>
                        ) : (
                          <span className="text-slate-400 italic">—</span>
                        )}
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        {lead.product_of_interest ? (
                          <span className="text-slate-600">{lead.product_of_interest}</span>
                        ) : (
                          <span className="text-slate-400 italic">—</span>
                        )}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-center">
                        <Badge
                          variant="outline"
                          className={`font-bold ${statusColors[lead.status]}`}
                        >
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {lead.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-xl">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-2xl border-slate-200">
                            {lead.status === "NEW" && (
                              <DropdownMenuItem
                                onClick={() => handleQualify(lead.id)}
                                disabled={actionLoading === lead.id}
                                className="py-2.5 rounded-xl flex items-center gap-2 cursor-pointer text-emerald-600 font-bold"
                              >
                                <CheckCircle className="h-4 w-4" />
                                {actionLoading === lead.id ? "Processing..." : "Qualify"}
                              </DropdownMenuItem>
                            )}
                            {lead.status !== "DISQUALIFIED" && (
                              <DropdownMenuItem
                                onClick={() => handleDisqualify(lead.id)}
                                disabled={actionLoading === lead.id}
                                className="py-2.5 rounded-xl flex items-center gap-2 cursor-pointer text-rose-600 font-bold"
                              >
                                <XCircle className="h-4 w-4" />
                                Disqualify
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => router.push(`/leads/${lead.id}`)}
                              className="py-2.5 rounded-xl flex items-center gap-2 cursor-pointer text-slate-600"
                            >
                              <ArrowRight className="h-4 w-4" />
                              View Details
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
