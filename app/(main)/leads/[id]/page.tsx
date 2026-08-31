"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Phone,
  Package,
  MessageSquare,
  Globe,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
  created_at: string;
  updated_at: string;
}

export default function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [source, setSource] = useState("");

  useEffect(() => {
    const fetchLead = async () => {
      try {
        const { id } = await params;
        const res = await fetch(`/api/leads/${id}`);
        if (res.ok) {
          const data = await res.json();
          setLead(data);
          setMessage(data.message || "");
          setSource(data.source || "");
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

  const handleSave = async () => {
    if (!lead) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, source }),
      });
      if (res.ok) {
        toast.success("Changes saved");
        const refreshed = await fetch(`/api/leads/${lead.id}`);
        if (refreshed.ok) {
          setLead(await refreshed.json());
        }
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to save changes");
      }
    } catch (error) {
      console.error("Error saving lead:", error);
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Info */}
          <Card className="rounded-2xl border-none shadow-xl shadow-slate-200/50 bg-white overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100 flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Phone className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">Contact</CardTitle>
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

          {/* Source */}
          <Card className="rounded-2xl border-none shadow-xl shadow-slate-200/50 bg-white overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100 flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                  <Globe className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">Source</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Lead Source
                </p>
                {lead.source ? (
                  <p className="text-slate-800 font-medium">{lead.source}</p>
                ) : (
                  <p className="text-slate-400 italic">No source specified</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Edit Fields */}
          <Card className="rounded-2xl border-none shadow-xl shadow-slate-200/50 bg-white overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100">
              <CardTitle className="text-lg">Edit Lead</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Message
                </p>
                <Textarea
                  placeholder="Update the lead message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[100px] border-slate-200 rounded-2xl bg-slate-50/50 focus:ring-2 focus:ring-indigo-100 resize-none"
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Source
                </p>
                <input
                  type="text"
                  placeholder="e.g. Website, Referral, Social Media..."
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-100 focus:border-transparent outline-none"
                />
              </div>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-[#150150] hover:bg-[#150150]/90 text-white rounded-xl"
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
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