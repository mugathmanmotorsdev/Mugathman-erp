"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Users,
  TrendingUp,
  ArrowRight,
  Clock,
  PlusCircle,
  MoveUpRight,
  MoveDownLeft,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Link from "next/link";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import SkeletonUi from "@/components/SkeletonUi";
import { formatCurrency } from "@/lib/utils/currency-formatter";
import { useFetchProduct } from "@/hooks/usefetchproducts";


interface Stats {
  totalProducts: number;
  totalCustomers: number;
  totalRevenue: number;
  lowStockItems: number;
  revenueGrowth: number;
}

interface Activity {
  id: string;
  type: "SALE" | "MOVEMENT";
  title: string;
  description: string;
  time: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);

  console.log(stats);
  const {
    products,
  } = useFetchProduct();
  const lowStockItems = 
  products
  .filter((product) => product.currentStock <= product.reorder_level)
  .sort((a, b) => a.currentStock - b.currentStock);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch("/api/dashboard/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
          setActivities(data.recentActivity);
        } else {
          toast.error("Failed to load dashboard data");
        }
      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} mins ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    <SkeletonUi />
  }

  return (
    <div className="flex flex-col gap-8 p-8 bg-[#EFF3F4] min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            Operations Overview
          </h1>
          <p className="text-slate-500 font-medium">
            Monitoring Mugathman Motors productivity and stock.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => router.push("/sales/new")}
            className="bg-[#150150] hover:bg-[#150150]/90 text-white px-6 h-12 rounded-2xl font-bold shadow-lg shadow-indigo-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Process Sale
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="flex flex-col md:flex-row gap-6">
        <Card className="flex flex-col gap-2 flex-1 rounded-lg px-5 shadow-xl shadow-slate-200/50 bg-white overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
          <CardHeader className="m-0">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              Total Revenue
            </p>
          </CardHeader>
          <CardContent className="m-0">
            <h3 className="text-3xl font-black text-slate-900">
              {formatCurrency(stats?.totalRevenue || 0)}
            </h3>
          </CardContent>
          <CardFooter className="m-0">
            <Badge
              variant="outline"
              className="flex border-emerald-100 bg-emerald-50 text-emerald-600 font-bold py-1"
            >
              <TrendingUp />
              {stats?.revenueGrowth?.toFixed(2) || 0}%
            </Badge>
          </CardFooter>
        </Card>

        <Card className="flex flex-col gap-2 flex-1 rounded-lg px-5 shadow-xl shadow-slate-200/50 bg-white overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
          <CardHeader className="m-0">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              Active Orders
            </p>
          </CardHeader>
          <CardContent className="m-0">
            <h3 className="text-3xl font-black text-slate-900">
              {activities.filter((a) => a.type === "SALE").length}
            </h3>
          </CardContent>
        </Card>

        <Card className="flex flex-col gap-2 flex-1 rounded-lg px-5 shadow-xl shadow-slate-200/50 bg-white overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
          <CardHeader className="m-0">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              Product Fleet
            </p>
          </CardHeader>
          <CardContent className="m-0">
            <h3 className="text-3xl font-black text-slate-900">
              {stats?.totalProducts || 0}
            </h3>
          </CardContent>
        </Card>

        <Card className="flex flex-col gap-2 flex-1 rounded-lg px-5 shadow-xl shadow-slate-200/50 bg-white overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
          <CardHeader className="m-0">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              Low Stock Alerts
            </p>
          </CardHeader>
          <CardContent className="m-0">
            <h3 className="text-3xl font-black text-slate-900">
              {stats?.lowStockItems || 0}
            </h3>
          </CardContent>
          <CardFooter className="m-0">
            <Badge
              variant="outline"
              className="bg-rose-50 border-rose-200 text-rose-700 font-bold px-2.5 py-1"
            >
              Critical
            </Badge>
          </CardFooter>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Areas */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recent transactions */}
          <Card className="rounded-lg border-none shadow-xl shadow-slate-200/50 bg-white overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-black text-slate-900">
                  Recent Transactions
                </CardTitle>
                <CardDescription className="text-slate-500 mt-1">
                  Latest sales and movements across all hubs.
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                className="rounded-xl font-bold text-indigo-600"
                asChild
                onClick={() => router.push("/sales")}
              >
                <Link href="/sales" className="flex">
                  View All
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-6">
                {activities.length === 0 ? (
                  <div className="py-20 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-3xl">
                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-10" />
                    <p>No recent activity recorded yet.</p>
                  </div>
                ) : (
                  activities.slice(0, 3).map((activity) => (
                    <Item
                      key={activity.id}
                      className="flex items-center gap-6 px-6 rounded-lg bg-slate-50/50 border border-slate-100 hover:shadow-sm transition-all cursor-pointer group"
                    >
                      <ItemMedia>
                        <div
                          className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${activity.type === "SALE" ? "bg-indigo-600 text-white" : "bg-white text-slate-900 border border-slate-200"}`}
                        >
                          {activity.type === "SALE" ? (
                            <MoveUpRight className="h-6 w-6" />
                          ) : (
                            <MoveDownLeft className="h-6 w-6" />
                          )}
                        </div>
                      </ItemMedia>
                      <ItemContent>
                        <ItemTitle>
                          {activity.title}
                        </ItemTitle>
                        <ItemDescription>
                          {getTimeAgo(activity.time)}
                        </ItemDescription>
                      </ItemContent>
                    </Item>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="rounded-lg border-none shadow-xl shadow-slate-200/50 bg-[#150150] text-white p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8">
                <Package className="h-20 w-20 text-white/5" />
              </div>
              <h4 className="text-xl font-black mb-2">Restock Inventory</h4>
              <p className="text-indigo-200/60 text-sm mb-8 leading-relaxed">
                Recorded a shipment of parts or new truck heads into the
                warehouse?
              </p>
              <Button
                onClick={() => router.push("/inventory/movements/new")}
                className="w-full h-14 rounded-2xl bg-white text-[#150150] hover:bg-indigo-50 font-black text-sm uppercase tracking-widest shadow-2xl"
              >
                Record Stock In
              </Button>
            </Card>
            <Card className="rounded-lg border-none shadow-xl shadow-slate-200/50 bg-emerald-600 text-white p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8">
                <Users className="h-20 w-20 text-white/5" />
              </div>
              <h4 className="text-xl font-black mb-2">Manage Customers</h4>
              <p className="text-emerald-50/60 text-sm mb-8 leading-relaxed">
                Update customer profiles, contact info, or review their purchase
                history.
              </p>
              <Button
                onClick={() => router.push("/customers")}
                className="w-full h-14 rounded-2xl bg-white text-emerald-600 hover:bg-emerald-50 font-black text-sm uppercase tracking-widest shadow-2xl"
              >
                Customer Directory
              </Button>
            </Card>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-8">
          <Card className="rounded-lg border-none shadow-xl shadow-slate-200/50 bg-white overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-black text-slate-900">
                Low Stock Items
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4 overflow-y-auto h-64">
                {
                  lowStockItems.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors group"
                  >
                    <span className="font-bold text-slate-700 group-hover:text-slate-900">
                      {item.name}
                    </span>
                    <Badge
                      className={`bg-red-50 text-red-600 border-none font-bold`}
                    >
                      {item.currentStock}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-lg border-none shadow-xl shadow-slate-200/50 bg-white overflow-hidden p-8">
            <div className="flex flex-col items-center text-center space-y-4 py-4">
              <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 border-2 border-dashed border-slate-200">
                <LayoutDashboard className="h-10 w-10" />
              </div>
              <div>
                <h5 className="font-black text-slate-900">Standard View</h5>
                <p className="text-xs text-slate-500 mt-1 px-4">
                  You are currently using the operational dashboard. Admin
                  powers are restricted here.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
