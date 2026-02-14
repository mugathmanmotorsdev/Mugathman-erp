"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Package,
  User,
  CircleDollarSign,
  ShoppingCart,
  Barcode,
  UserPlus,
  Users,
  Phone,
  Mail,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Product {
  id: string;
  name: string;
  sku: string;
  tracking_type: "BATCH" | "SERIAL";
  unit_price: string;
}

interface Location {
  id: string;
  name: string;
}

interface Customer {
  id: string;
  full_name: string;
  phone: string;
}

interface Vehicle {
  id: string;
  vin: string;
  product_id: string;
  status: string;
}

interface SaleItem {
  id: string; // temp id for UI
  product_id: string;
  location_id: string;
  vehicle_id: string;
  quantity: number;
  unit_price: number;
  product_name: string;
  tracking_type: string;
  vin?: string;
}

export default function NewSalePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);

  const [products, setProducts] = useState<Product[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([]);

  // Customer State
  const [customerMode, setCustomerMode] = useState<"existing" | "new">("existing");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [newCustomer, setNewCustomer] = useState({
    full_name: "",
    phone: "",
    email: "",
    address: "",
  });

  // Sale Items State
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [prodRes, locRes, custRes, vehRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/inventory/locations"),
          fetch("/api/customers"),
          fetch("/api/products/vehicle"),
        ]);

        if (prodRes.ok) {
          const data = await prodRes.json();
          setProducts(data.products || []);
        }
        if (locRes.ok) {
          const data = await locRes.json();
          setLocations(data || []);
        }
        if (custRes.ok) {
          const data = await custRes.json();
          setCustomers(data || []);
        }
        if (vehRes.ok) {
          const data = await vehRes.json();
          setAvailableVehicles(data || []);
        }
      } catch (error) {
        console.error("Error loading data", error);
        toast.error("Failed to load dependency data");
      } finally {
        setFetchingData(false);
      }
    };

    loadData();
  }, []);

  const addEmptyItem = () => {
    const item: SaleItem = {
      id: Math.random().toString(36).substr(2, 9),
      product_id: "",
      location_id: locations[0]?.id || "",
      vehicle_id: "",
      quantity: 1,
      unit_price: 0,
      product_name: "",
      tracking_type: "BATCH",
    };
    setSaleItems([...saleItems, item]);
  };

  const updateItem = (id: string, updates: Partial<SaleItem>) => {
    setSaleItems(
      saleItems.map((item) => {
        if (item.id === id) {
          const updated = { ...item, ...updates };

          // If product changed, update defaults
          if (updates.product_id) {
            const prod = products.find((p) => p.id === updates.product_id);
            if (prod) {
              updated.product_name = prod.name;
              updated.unit_price = parseFloat(prod.unit_price);
              updated.tracking_type = prod.tracking_type;
              updated.vehicle_id = "";
              updated.vin = "";
            }
          }

          // If vehicle changed, update VIN
          if (updates.vehicle_id) {
            const veh = availableVehicles.find((v) => v.id === updates.vehicle_id);
            updated.vin = veh?.vin;
          }

          return updated;
        }
        return item;
      })
    );
  };

  const removeItem = (id: string) => {
    setSaleItems(saleItems.filter((item) => item.id !== id));
  };

  const handleSubmit = async () => {
    // Validation
    if (customerMode === "existing" && !selectedCustomerId) {
      toast.error("Please select a customer");
      return;
    }
    if (customerMode === "new" && (!newCustomer.full_name || !newCustomer.phone)) {
      toast.error("Please fill in the new customer's name and phone");
      return;
    }
    if (saleItems.length === 0) {
      toast.error("Please add at least one item to the sale");
      return;
    }

    // Check if all items are valid
    const invalidItem = saleItems.find(item =>
      !item.product_id ||
      !item.location_id ||
      (item.tracking_type === "SERIAL" && !item.vehicle_id) ||
      item.quantity <= 0
    );

    if (invalidItem) {
      toast.error("Some items are incomplete or have invalid quantities");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        customer_id: customerMode === "existing" ? selectedCustomerId : null,
        customer_details: customerMode === "new" ? newCustomer : null,
        items: saleItems.map((item) => ({
          product_id: item.product_id,
          location_id: item.location_id,
          vehicle_id: item.vehicle_id || null,
          quantity: item.quantity,
          unit_price: item.unit_price,
        })),
      };

      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("Sale completed successfully");
        router.push("/sales");
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to create sale");
      }
    } catch (error) {
      console.error("Error creating sale", error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    return saleItems.reduce((acc, item) => acc + item.quantity * item.unit_price, 0);
  };

  if (fetchingData) {
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
              Direct Sales Order
            </h1>
            <p className="text-sm text-slate-500">
              Process transactions and register new customers instantly.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Form */}
        <div className="lg:col-span-2 space-y-6">

          {/* Customer Selection Card */}
          <Card className="rounded-2xl border-none shadow-xl shadow-slate-200/50 bg-white overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100 flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">Customer Selection</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <Tabs value={customerMode} onValueChange={(v) => setCustomerMode(v as "existing" | "new")} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8 p-1 bg-slate-100 rounded-2xl h-14">
                  <TabsTrigger value="existing" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Existing Customer
                  </TabsTrigger>
                  <TabsTrigger value="new" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    New Customer
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="existing" className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-slate-600 font-bold ml-1">Select Client</Label>
                    <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                      <SelectTrigger className="h-16 w-full border-slate-200 bg-slate-50/50 rounded-xl focus:ring-indigo-100">
                        <SelectValue placeholder="Search for a customer..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-slate-200 shadow-2xl">
                        {customers.map((c) => (
                          <SelectItem key={c.id} value={c.id} className="py-3 rounded-xl">
                            <div className="flex flex-col">
                              <span className="font-semibold text-slate-800">{c.full_name}</span>
                              <span className="text-[10px] text-slate-500">{c.phone}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                <TabsContent value="new" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-slate-600 font-bold ml-1">Full Name *</Label>
                      <div className="relative">
                        <Input
                          placeholder="Enter customer name"
                          value={newCustomer.full_name}
                          onChange={(e) => setNewCustomer({ ...newCustomer, full_name: e.target.value })}
                          className="h-12 pl-10 border-slate-200 rounded-2xl bg-slate-50/50"
                        />
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-600 font-bold ml-1">Phone Number *</Label>
                      <div className="relative">
                        <Input
                          placeholder="Enter phone number"
                          value={newCustomer.phone}
                          onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                          className="h-12 pl-10 border-slate-200 rounded-2xl bg-slate-50/50"
                        />
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-600 font-bold ml-1">Email (Optional)</Label>
                      <div className="relative">
                        <Input
                          placeholder="customer@example.com"
                          value={newCustomer.email}
                          onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                          className="h-12 pl-10 border-slate-200 rounded-2xl bg-slate-50/50"
                        />
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-600 font-bold ml-1">Address (Optional)</Label>
                      <div className="relative">
                        <Input
                          placeholder="Residential address"
                          value={newCustomer.address}
                          onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                          className="h-12 pl-10 border-slate-200 rounded-2xl bg-slate-50/50"
                        />
                        <Home className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
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
                  <CardTitle className="text-lg">Sale Line Items</CardTitle>
                </div>
              </div>
              <Button onClick={addEmptyItem} variant="outline" className="rounded-xl border-slate-200 font-bold text-slate-600 hover:bg-slate-100">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50/50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Product</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Serial/Location</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest w-24">Qty</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Price</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-widest">Subtotal</th>
                      <th className="px-6 py-4 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {saleItems.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                          <Package className="h-12 w-12 mx-auto mb-3 opacity-10" />
                          <p className="font-medium">No items added to the sale.</p>
                          <Button onClick={addEmptyItem} variant="link" className="text-indigo-600 font-bold mt-2">
                            Add the first product
                          </Button>
                        </td>
                      </tr>
                    ) : (
                      saleItems.map((item) => (
                        <tr key={item.id} className="group hover:bg-slate-50/30 transition-colors">
                          <td className="px-6 py-4 min-w-[200px]">
                            <Select
                              value={item.product_id}
                              onValueChange={(val) => updateItem(item.id, { product_id: val })}
                            >
                              <SelectTrigger className="h-10 border-slate-200 rounded-xl bg-white shadow-sm">
                                <SelectValue placeholder="Pick a product" />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl">
                                {products.map((p) => (
                                  <SelectItem key={p.id} value={p.id} className="rounded-lg">
                                    <div className="flex flex-col">
                                      <span className="font-semibold text-sm">{p.name}</span>
                                      <span className="text-[10px] text-slate-400">{p.sku}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="px-6 py-4 space-y-2">
                            <Select
                              value={item.location_id}
                              onValueChange={(val) => updateItem(item.id, { location_id: val })}
                            >
                              <SelectTrigger className="h-9 border-slate-100 rounded-lg bg-slate-50/50 text-xs">
                                <SelectValue placeholder="Warehouse" />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl">
                                {locations.map((l) => (
                                  <SelectItem key={l.id} value={l.id} className="text-xs">
                                    {l.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            {item.tracking_type === "SERIAL" && (
                              <Select
                                value={item.vehicle_id}
                                onValueChange={(val) => updateItem(item.id, { vehicle_id: val })}
                              >
                                <SelectTrigger className="h-9 border-indigo-100 rounded-lg bg-indigo-50/30 text-xs font-mono font-bold text-indigo-700">
                                  <SelectValue placeholder="Select VIN" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                  {availableVehicles
                                    .filter(v => v.product_id === item.product_id)
                                    .map((v) => (
                                      <SelectItem key={v.id} value={v.id} className="text-xs font-mono">
                                        {v.vin}
                                      </SelectItem>
                                    ))}
                                  {availableVehicles.filter(v => v.product_id === item.product_id).length === 0 && (
                                    <div className="p-2 text-[10px] text-slate-400 text-center">No available units</div>
                                  )}
                                </SelectContent>
                              </Select>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <Input
                              type="number"
                              disabled={item.tracking_type === "SERIAL"}
                              value={item.quantity}
                              onChange={(e) => updateItem(item.id, { quantity: parseInt(e.target.value) || 0 })}
                              className="h-10 border-slate-200 rounded-xl bg-white shadow-sm text-center font-bold"
                            />
                          </td>
                          <td className="px-6 py-4 min-w-[120px]">
                            <div className="relative">
                              <Input
                                type="number"
                                value={item.unit_price}
                                onChange={(e) => updateItem(item.id, { unit_price: parseFloat(e.target.value) || 0 })}
                                className="h-10 pl-7 border-slate-200 rounded-xl bg-white shadow-sm font-semibold"
                              />
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right min-w-[100px]">
                            <span className="font-black text-slate-900">
                              ${(item.quantity * item.unit_price).toLocaleString()}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem(item.id)}
                              className="text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl h-8 w-8"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Summary */}
        <div className="space-y-6">
          <Card className="border-none shadow-2xl shadow-indigo-200/50 bg-[#150150] text-white rounded-2xl overflow-hidden sticky top-6">
            <CardHeader className="pb-8 pt-12 px-10">
              <div className="flex items-center gap-2 text-indigo-200 text-[10px] font-black uppercase tracking-[0.2em]">
                <CircleDollarSign className="h-4 w-4" />
                Transaction Total
              </div>
              <div className="mt-4">
                <h3 className="text-5xl font-black tabular-nums tracking-tighter">
                  ${calculateTotal().toLocaleString()}
                </h3>
                <p className="text-indigo-300/60 text-xs mt-2 font-medium">Inclusive of all items and processing</p>
              </div>
            </CardHeader>
            <CardContent className="px-10 pb-10 space-y-8">
              <div className="space-y-4 border-t border-white/5 pt-8">
                <div className="flex justify-between items-center">
                  <span className="text-indigo-200/60 text-sm font-bold uppercase tracking-widest text-[10px]">Total Line Items</span>
                  <span className="font-black text-xl">{saleItems.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-indigo-200/60 text-sm font-bold uppercase tracking-widest text-[10px]">Net Quantities</span>
                  <span className="font-black text-xl">{saleItems.reduce((acc, i) => acc + i.quantity, 0)}</span>
                </div>
              </div>

              <div className="bg-white/5 rounded-3xl p-6 border border-white/5 space-y-3">
                <p className="text-[10px] text-indigo-200/80 leading-relaxed font-bold uppercase tracking-widest">
                  Compliance Check
                </p>
                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-indigo-400/20 flex items-center justify-center shrink-0">
                    <Barcode className="h-3 w-3 text-indigo-300" />
                  </div>
                  <p className="text-[10px] text-indigo-100/60 leading-relaxed">
                    By confirming, you verify that products and VINs have been physically inspected and the sale is legally binding.
                  </p>
                </div>
              </div>

              <Button
                disabled={loading || saleItems.length === 0}
                onClick={handleSubmit}
                className="w-full h-16 rounded-2xl bg-white text-[#150150] hover:bg-emerald-50 hover:text-emerald-900 font-black text-base uppercase tracking-widest shadow-2xl transition-all active:scale-95 group"
              >
                {loading ? "Processing Order..." : "Finalize & Record Sale"}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl shadow-slate-200/50 bg-white rounded-2xl p-6 overflow-hidden relative">
            <div className="absolute top-0 right-0 h-24 w-24 bg-slate-50 rounded-bl-full -mr-12 -mt-12 transition-all group-hover:bg-indigo-50" />
            <div className="relative z-10 space-y-4">
              <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs">Helpful Hint</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                You can create a new customer by switching to the "New Customer" tab above. Fill their basic info and they'll be saved automatically.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
