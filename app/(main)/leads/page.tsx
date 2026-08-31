"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  UserCheck,
  RefreshCw,
  Download,
  ArrowRight,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import SearchInput from "@/components/ui/SearchInput";
import FilterBar from "@/components/ui/FilterBar";
import { MoreVertical } from "lucide-react";

interface Lead {
  id: string;
  full_name: string;
  phone: string;
  product_of_interest: string | null;
  message: string | null;
  source: string | null;
  created_at: string;
  updated_at: string;
}

export default function LeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);

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
  }, [searchQuery]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;
    window.history.replaceState(null, "", newUrl);
  }, [searchQuery]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlSearch = params.get("search");
    if (urlSearch) setSearchQuery(urlSearch);
  }, []);

  const filteredLeads = leads.filter(
    (lead) =>
      lead.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery) ||
      (lead.product_of_interest &&
        lead.product_of_interest.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (lead.source &&
        lead.source.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex flex-col gap-6 p-6 bg-[#EFF3F4] min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeading
          title="Leads"
          description="Manage visitor inquiries from the website."
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
          <Button
            variant="outline"
            className="h-12 rounded-2xl border-slate-200 font-bold text-slate-600"
            onClick={() => {
              const params = new URLSearchParams()
              if (searchQuery) params.set("search", searchQuery)
              window.open(`/api/export/leads?${params.toString()}`, "_blank")
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Total Leads
          </p>
          <h3 className="text-3xl font-black text-slate-900 mt-1">
            {leads.length}
          </h3>
        </div>
      </div>

      {/* Search */}
      <FilterBar>
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by name, phone, product, or source..."
        />
      </FilterBar>

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
                  Phone
                </TableHead>
                <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Interest
                </TableHead>
                <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Source
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
                filteredLeads.map((lead) => (
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
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <span className="text-slate-600">{lead.phone}</span>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      {lead.product_of_interest ? (
                        <span className="text-slate-600">{lead.product_of_interest}</span>
                      ) : (
                        <span className="text-slate-400 italic">—</span>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      {lead.source ? (
                        <span className="text-slate-600 flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {lead.source}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">—</span>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-xl"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/leads/${lead.id}`);
                        }}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
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