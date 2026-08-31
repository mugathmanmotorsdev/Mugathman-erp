"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Phone,
  Package,
  MessageSquare,
  UserCheck,
  XCircle,
  Send,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SkeletonUi from "@/components/SkeletonUi";

interface Lead {
  id: string;
  full_name: string;
  phone: string;
  product_of_interest: string | null;
  message: string | null;
  source: string | null;
  status: "NEW" | "QUALIFIED" | "DISQUALIFIED";
  meta_conversion_id: string | null;
  created_at: string;
  updated_at: string;
}

const statusBadges = {
  NEW: { color: "bg-slate-100 text-slate-600 border-slate-200", icon: Clock },
  QUALIFIED: { color: "bg-emerald-50 text-emerald-600 border-emerald-200", icon: CheckCircle2 },
  DISQUALIFIED: { color: "bg-rose-50 text-rose-600 border-rose-200", icon: XCircle },
};

export default function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchLead = async () => {
      try {
        const { id } = await params;
        const res = await fetch(`/api/leads/${id}`);
        if (res.ok) {
          const data = await res.json();
          setLead(data);
        } else {
          toast.error("Failed to load lead");
          router.push("/leads");
        }
      } catch (error) {
        console.error("Error fetching lead:", error);
        toast.error("Internal server error");
        router.push("/leads");
      } finally {
        setLoading(false);
      }
    };
    fetchLead();
  }, [params, router]);

  const handleStatusChange = async (newStatus: string) => {
    if (!lead) return;
    setActionLoading(newStatus);
    try {
      const res = await fetch(`/api/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setLead(updated);
        toast.success(`Lead marked as ${newStatus.toLowerCase()}`);
        if (newStatus === "QUALIFIED") {
          // Trigger Meta conversion
          await fetch(`/api/leads/${lead.id}/qualify`, { method: "POST" });
          toast.success("Meta conversion queued");
          const refreshed = await fetch(`/api/leads/${lead.id}`);
          if (refreshed.ok) {
            setLead(await refreshed.json());
          }
        }
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <SkeletonUi />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center p-16">
        <p className="text-slate-400 text-lg">Lead not found</p>
        <Button variant="link" onClick={() => router.push("/leads")}>
          Back to Leads
        </Button>
      </div>
    );
  }

  const badge = statusBadges[lead.status];
  const StatusIcon = badge.icon;

  return (
    <div className="flex flex-col gap-6 p-6 bg-[#EFF3F4] min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-white border border-slate-200 shadow-sm"
            onClick={() => router.push("/leads")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {lead.full_name}
            </h1>
            <p className="text-sm text-slate-500">
              Lead #{lead.id.slice(0, 8)} · Added{" "}
              {new Date(lead.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <Badge variant="outline" className={`font-bold ${badge.color}`}>
          <StatusIcon className="h-4 w-4 mr-1" />
          {lead.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Info */}
          <Card className="rounded-2xl border-none shadow-xl shadow-slate-200/50 bg-white overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100 flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <UserCheck className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Full Name
                </p>
                <p className="text-slate-800 font-medium">{lead.full_name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Phone
                </p>
                <p className="text-slate-800 font-medium flex items-center gap-2">
                  <Phone className="h-3 w-3 text-slate-400" />
                  {lead.phone}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Product Interest & Message */}
          <Card className="rounded-2xl border-none shadow-xl shadow-slate-200/50 bg-white overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100 flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">Inquiry Details</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Product of Interest
                </p>
                <p className="text-slate-800 font-medium flex items-center gap-2">
                  <Package className="h-3 w-3 text-slate-400" />
                  {lead.product_of_interest || "—"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Message
                </p>
                <p className="text-slate-700 bg-slate-50 rounded-xl p-4 border border-slate-100">
                  {lead.message || "No message provided."}
                </p>
              </div>
            </CardContent>
          </Card>
          </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Actions */}
          <Card className="rounded-2xl border-none shadow-xl shadow-slate-200/50 bg-white overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100">
              <CardTitle className="text-lg">Status Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              <Button
                variant={lead.status === "NEW" ? "default" : "outline"}
                className={`w-full h-12 rounded-xl font-bold ${
                  lead.status === "NEW"
                    ? "bg-slate-800 hover:bg-slate-900 text-white"
                    : "border-slate-200 text-slate-600"
                }`}
                onClick={() => handleStatusChange("NEW")}
                disabled={actionLoading === "NEW" || lead.status === "NEW"}
              >
                <Clock className="h-4 w-4 mr-2" />
                {actionLoading === "NEW" ? "Updating..." : "Mark New"}
              </Button>
              <Button
                variant={lead.status === "QUALIFIED" ? "default" : "outline"}
                className={`w-full h-12 rounded-xl font-bold ${
                  lead.status === "QUALIFIED"
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "border-slate-200 text-slate-600"
                }`}
                onClick={() => handleStatusChange("QUALIFIED")}
                disabled={
                  actionLoading === "QUALIFIED" || lead.status === "QUALIFIED"
                }
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {actionLoading === "QUALIFIED"
                  ? "Qualifying..."
                  : "Qualify Lead"}
              </Button>
              <Button
                variant={lead.status === "DISQUALIFIED" ? "default" : "outline"}
                className={`w-full h-12 rounded-xl font-bold ${
                  lead.status === "DISQUALIFIED"
                    ? "bg-rose-600 hover:bg-rose-700 text-white"
                    : "border-slate-200 text-slate-600"
                }`}
                onClick={() => handleStatusChange("DISQUALIFIED")}
                disabled={
                  actionLoading === "DISQUALIFIED" ||
                  lead.status === "DISQUALIFIED"
                }
              >
                <XCircle className="h-4 w-4 mr-2" />
                {actionLoading === "DISQUALIFIED"
                  ? "Updating..."
                  : "Disqualify"}
              </Button>
            </CardContent>
          </Card>

          {/* Meta Conversion Status */}
          <Card className="rounded-2xl border-none shadow-xl shadow-slate-200/50 bg-white overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100">
              <CardTitle className="text-lg">Meta Conversion</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {lead.status === "QUALIFIED" ? (
                lead.meta_conversion_id ? (
                  <div className="flex items-center gap-3 text-emerald-600">
                    <Send className="h-5 w-5" />
                    <div>
                      <p className="font-bold text-sm">Sent to Meta</p>
                      <p className="text-xs text-slate-500 font-mono">
                        {lead.meta_conversion_id}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-amber-600">
                    <Clock className="h-5 w-5" />
                    <p className="text-sm font-medium">
                      Conversion queued — pending delivery
                    </p>
                  </div>
                )
              ) : (
                <p className="text-sm text-slate-400">
                  Meta conversion will be sent when lead is qualified.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card className="rounded-2xl border-none shadow-xl shadow-slate-200/50 bg-white overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100">
              <CardTitle className="text-lg">Metadata</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Created</span>
                <span className="font-medium text-slate-700">
                  {new Date(lead.created_at).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Last Updated</span>
                <span className="font-medium text-slate-700">
                  {new Date(lead.updated_at).toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}