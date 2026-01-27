"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Plus,
  Minus,
  Package,
  MapPin,
  FileText,
  Truck,
  Barcode,
  AlertCircle,
  CheckCircle2,
  Calendar,
  User,
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
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface Product {
  id: string;
  name: string;
  sku: string;
  tracking_type: "BATCH" | "SERIAL";
  currentStock: number;
}

interface Location {
  id: string;
  name: string;
  department: string;
}

interface Vehicle {
  id: string;
  vin: string;
  status: string;
}

export default function NewMovementPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetchingProducts, setFetchingProducts] = useState(true);
  const [fetchingLocations, setFetchingLocations] = useState(true);
  const [fetchingVehicles, setFetchingVehicles] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([]);

  const [movementType, setMovementType] = useState<"IN" | "OUT">("IN");
  const [formData, setFormData] = useState({
    product_id: "",
    location_id: "",
    vehicle_id: "",
    new_vin: "",
    quantity: "1",
    reason: "",
    reference_type: "",
    reference_id: "",
  });

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Fetch products and locations on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [prodRes, locRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/inventory-locations"),
        ]);

        if (prodRes.ok) {
          const data = await prodRes.json();
          setProducts(data.products || []);
        }
        if (locRes.ok) {
          const data = await locRes.json();
          setLocations(data || []);
        }
      } catch (error) {
        console.error("Error loading data", error);
        toast.error("Failed to load products or locations");
      } finally {
        setFetchingProducts(false);
        setFetchingLocations(false);
      }
    };

    loadInitialData();
  }, []);

  // Fetch vehicles if product is SERIAL and movement is OUT
  useEffect(() => {
    if (selectedProduct?.tracking_type === "SERIAL" && movementType === "OUT") {
      const loadVehicles = async () => {
        setFetchingVehicles(true);
        try {
          const res = await fetch("/api/products/vehicle");
          if (res.ok) {
            const data = await res.json();
            // Filter by product_id if needed, though the API returns all available
            const filtered = data.filter(
              (v: any) => v.product_id === selectedProduct.id,
            );
            setAvailableVehicles(filtered);
          }
        } catch (error) {
          console.error("Error loading vehicles", error);
        } finally {
          setFetchingVehicles(false);
        }
      };
      loadVehicles();
    } else {
      setAvailableVehicles([]);
    }
  }, [selectedProduct, movementType]);

  const handleProductChange = (productId: string) => {
    const prod = products.find((p) => p.id === productId) || null;
    setSelectedProduct(prod);
    setFormData({
      ...formData,
      product_id: productId,
      vehicle_id: "",
      new_vin: "",
      quantity: prod?.tracking_type === "SERIAL" ? "1" : formData.quantity,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalVehicleId = formData.vehicle_id;

      // If it's IN and SERIAL, we might need to create the vehicle first if it doesn't exist
      // Based on user request "a vin number for each product"
      if (
        movementType === "IN" &&
        selectedProduct?.tracking_type === "SERIAL" &&
        formData.new_vin
      ) {
        const vehicleRes = await fetch("/api/products/vehicle", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            product_id: formData.product_id,
            inventory_location_id: formData.location_id,
            vin: formData.new_vin,
          }),
        });

        if (!vehicleRes.ok) {
          const error = await vehicleRes.json();
          throw new Error(error.error || "Failed to register vehicle VIN");
        }
        const newVehicle = await vehicleRes.json();
        finalVehicleId = newVehicle.id;
      }

      // Create movement
      const movementRes = await fetch("/api/inventory-movement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: formData.product_id,
          location_id: formData.location_id,
          vehicle_id: finalVehicleId,
          quantity:
            movementType === "OUT"
              ? -Math.abs(Number(formData.quantity))
              : Math.abs(Number(formData.quantity)),
          reason: formData.reason,
          movement_type: movementType,
          reference_type: formData.reference_type,
          reference_id: formData.reference_id,
        }),
      });

      if (movementRes.ok) {
        toast.success(
          `Stock ${movementType === "IN" ? "added" : "removed"} successfully`,
        );
        router.push("/inventory");
      } else {
        const error = await movementRes.json();
        toast.error(error.error || "Failed to record movement");
      }
    } catch (error: any) {
      console.error("Error submitting movement", error);
      toast.error(error.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const reasons = [
    { label: "Purchase", value: "PURCHASE" },
    { label: "Sale", value: "SALE" },
    { label: "Damage", value: "DAMAGE" },
    { label: "Adjustment", value: "ADJUSTMENT" },
  ];

  const refTypes = [
    { label: "Purchase Order", value: "PURCHASE" },
    { label: "Sales Order", value: "SALE" },
    { label: "Stock Adjustment", value: "ADJUSTMENT" },
  ];

  return (
    <div className="flex flex-col gap-6 p-6 bg-slate-50/50 min-h-screen">
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
              Record Stock Movement
            </h1>
            <p className="text-sm text-slate-500">
              Update inventory levels for parts, equipment or fertilizers.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-1 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <button
            onClick={() => setMovementType("IN")}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
              movementType === "IN"
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-100"
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            <Plus className="h-4 w-4" />
            STOCKS IN
          </button>
          <button
            onClick={() => setMovementType("OUT")}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
              movementType === "OUT"
                ? "bg-rose-500 text-white shadow-lg shadow-rose-100"
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            <Minus className="h-4 w-4" />
            STOCKS OUT
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-3xl border-none shadow-xl shadow-slate-200/50 bg-white overflow-hidden">
            <CardHeader className="border-b border-slate-50 pb-6 pt-8 px-8">
              <div className="flex items-center gap-3">
                <div
                  className={`h-12 w-12 rounded-2xl flex items-center justify-center ${movementType === "IN" ? "bg-emerald-50" : "bg-rose-50"}`}
                >
                  {movementType === "IN" ? (
                    <Plus
                      className={`h-6 w-6 ${movementType === "IN" ? "text-emerald-600" : "text-rose-600"}`}
                    />
                  ) : (
                    <Minus
                      className={`h-6 w-6 ${movementType === "IN" ? "text-emerald-600" : "text-rose-600"}`}
                    />
                  )}
                </div>
                <div>
                  <CardTitle>Movement Details</CardTitle>
                  <CardDescription>
                    Specify the product, quantity and destination
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              {/* Product & Location Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-slate-700 font-bold flex items-center gap-2">
                    <Package className="h-4 w-4 text-indigo-500" />
                    Select Product
                  </Label>
                  <Select
                    onValueChange={handleProductChange}
                    value={formData.product_id}
                  >
                    <SelectTrigger className="h-12 border-slate-200 bg-slate-50/50 rounded-2xl focus:ring-2 focus:ring-indigo-100 transition-all">
                      <SelectValue
                        placeholder={
                          fetchingProducts
                            ? "Loading products..."
                            : "Choose a product"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-200 shadow-2xl">
                      {products.map((p) => (
                        <SelectItem
                          key={p.id}
                          value={p.id}
                          className="py-3 rounded-xl focus:bg-indigo-50"
                        >
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-800">
                              {p.name}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono tracking-wider">
                              {p.sku} • {p.tracking_type}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-slate-700 font-bold flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-indigo-500" />
                    Inventory Location
                  </Label>
                  <Select
                    onValueChange={(val) =>
                      setFormData({ ...formData, location_id: val })
                    }
                    value={formData.location_id}
                  >
                    <SelectTrigger className="h-12 border-slate-200 bg-slate-50/50 rounded-2xl focus:ring-2 focus:ring-indigo-100 transition-all">
                      <SelectValue
                        placeholder={
                          fetchingLocations
                            ? "Loading locations..."
                            : "Choose location"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-200 shadow-2xl">
                      {locations.map((l) => (
                        <SelectItem
                          key={l.id}
                          value={l.id}
                          className="py-3 rounded-xl"
                        >
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-800">
                              {l.name}
                            </span>
                            <span className="text-[10px] text-slate-500 uppercase tracking-widest">
                              {l.department}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Tracking Specific Logic */}
              {selectedProduct && (
                <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-200/50 pb-4">
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="outline"
                        className="bg-white border-slate-200 text-slate-600 px-3 py-1 rounded-lg"
                      >
                        {selectedProduct.tracking_type} TRACKING
                      </Badge>
                      <span className="text-sm font-medium text-slate-500 underline underline-offset-4 decoration-slate-200">
                        Current Balance: {selectedProduct.currentStock}
                      </span>
                    </div>
                  </div>

                  {selectedProduct.tracking_type === "BATCH" ? (
                    <div className="space-y-3 max-w-xs">
                      <Label className="text-slate-700 font-bold">
                        Quantity to {movementType === "IN" ? "Add" : "Remove"}
                      </Label>
                      <div className="relative">
                        <Input
                          type="number"
                          min="1"
                          value={formData.quantity}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              quantity: e.target.value,
                            })
                          }
                          className="h-14 pl-12 text-xl font-bold border-slate-200 bg-white rounded-2xl focus:ring-2 focus:ring-indigo-100"
                        />
                        <div
                          className={`absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 rounded-lg flex items-center justify-center shadow-sm ${movementType === "IN" ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"}`}
                        >
                          {movementType === "IN" ? (
                            <Plus className="h-3 w-3" />
                          ) : (
                            <Minus className="h-3 w-3" />
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {movementType === "IN" ? (
                        <div className="space-y-3">
                          <Label className="text-slate-700 font-bold flex items-center gap-2">
                            <Barcode className="h-4 w-4 text-indigo-500" />
                            Assign VIN Number
                          </Label>
                          <Input
                            placeholder="Enter Chassis / VIN Number..."
                            value={formData.new_vin}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                new_vin: e.target.value,
                              })
                            }
                            className="h-12 border-slate-200 bg-white rounded-2xl focus:ring-2 focus:ring-indigo-100 transition-all font-mono uppercase tracking-wider"
                          />
                          <p className="text-[11px] text-slate-500">
                            Each piece of equipment requires a unique
                            identifier.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <Label className="text-slate-700 font-bold flex items-center gap-2">
                            <Truck className="h-4 w-4 text-indigo-500" />
                            Select Specific Vehicle (VIN)
                          </Label>
                          <Select
                            onValueChange={(val) =>
                              setFormData({ ...formData, vehicle_id: val })
                            }
                            value={formData.vehicle_id}
                          >
                            <SelectTrigger className="h-12 border-slate-200 bg-white rounded-2xl focus:ring-2 focus:ring-indigo-100 transition-all">
                              <SelectValue
                                placeholder={
                                  fetchingVehicles
                                    ? "Searching available fleet..."
                                    : "Select VIN"
                                }
                              />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-slate-200 shadow-2xl">
                              {availableVehicles.length === 0 ? (
                                <div className="p-4 text-center text-slate-500 text-sm">
                                  No available vehicles of this type
                                </div>
                              ) : (
                                availableVehicles.map((v) => (
                                  <SelectItem
                                    key={v.id}
                                    value={v.id}
                                    className="py-2 rounded-xl h-12"
                                  >
                                    <span className="font-mono font-bold">
                                      {v.vin}
                                    </span>
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Reference Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <Label className="text-slate-700 font-bold">
                    Movement Reason
                  </Label>
                  <Select
                    onValueChange={(val) =>
                      setFormData({ ...formData, reason: val })
                    }
                    value={formData.reason}
                  >
                    <SelectTrigger className="h-12 border-slate-200 bg-slate-50/50 rounded-2xl">
                      <SelectValue placeholder="Select Reason" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-200">
                      {reasons.map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label className="text-slate-700 font-bold">
                    Reference Type
                  </Label>
                  <Select
                    onValueChange={(val) =>
                      setFormData({ ...formData, reference_type: val })
                    }
                    value={formData.reference_type}
                  >
                    <SelectTrigger className="h-12 border-slate-200 bg-slate-50/50 rounded-2xl">
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-200">
                      {refTypes.map((rt) => (
                        <SelectItem key={rt.value} value={rt.value}>
                          {rt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label className="text-slate-700 font-bold">
                    Reference ID
                  </Label>
                  <div className="relative">
                    <Input
                      placeholder="e.g. PO-8829"
                      value={formData.reference_id}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          reference_id: e.target.value,
                        })
                      }
                      className="h-12 pl-10 border-slate-200 bg-slate-50/50 rounded-2xl"
                    />
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-6">
          <Card className="border-none shadow-xl shadow-slate-200/50 bg-white rounded-3xl overflow-hidden">
            <CardHeader className="bg-[#150150] text-white min-h-[120px] pb-10 flex flex-col justify-end">
              <CardTitle className="text-lg opacity-80 font-medium">
                Movement Summary
              </CardTitle>
              <h2 className="text-3xl font-black">
                {movementType === "IN"
                  ? "Stock Acquisition"
                  : "Stock Disbursement"}
              </h2>
            </CardHeader>
            <CardContent className="px-8 -mt-6">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-lg p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 font-bold flex items-center gap-2">
                      <User className="h-3 w-3" /> RECORDED BY
                    </span>
                    <span className="font-semibold text-slate-800">
                      Administrator
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 font-bold flex items-center gap-2">
                      <Calendar className="h-3 w-3" /> TIMESTAMP
                    </span>
                    <span className="font-semibold text-slate-800">
                      {new Date().toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div
                  className={`p-4 rounded-xl border flex items-center gap-3 ${movementType === "IN" ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-rose-50 border-rose-100 text-rose-700"}`}
                >
                  {movementType === "IN" ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <AlertCircle className="h-5 w-5" />
                  )}
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-tighter opacity-70">
                      Impacted Units
                    </span>
                    <span className="text-lg font-black leading-none">
                      {movementType === "IN" ? "+" : "-"}
                      {formData.quantity} {selectedProduct && "Units"}
                    </span>
                  </div>
                </div>

                <Button
                  className={`w-full h-14 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] ${
                    movementType === "IN"
                      ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200"
                      : "bg-rose-600 hover:bg-rose-700 shadow-rose-200"
                  }`}
                  disabled={
                    loading ||
                    !formData.product_id ||
                    !formData.location_id ||
                    !formData.reason
                  }
                  onClick={handleSubmit}
                >
                  {loading
                    ? "Processing..."
                    : `Confirm ${movementType} Movement`}
                  <Save className="ml-3 h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Guidelines */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                <AlertCircle className="h-4 w-4 text-indigo-600" />
              </div>
              <h4 className="font-bold text-indigo-900">Compliance Warning</h4>
            </div>
            <p className="text-xs text-indigo-700 leading-relaxed font-medium">
              Stock movements are legally binding records. Ensure VIN numbers
              are cross-checked with chassis plates before confirmation. BATCH
              tracking should reflect physical count exactly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
