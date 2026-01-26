"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
    ChevronLeft, 
    Save, 
    X, 
    Package, 
    Info, 
    Settings, 
    DollarSign, 
    Layers,
    Barcode
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function NewProductPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        sku: "",
        category: "",
        unit: "PCS",
        unit_price: "",
        tracking_type: "BATCH",
        reorder_level: "0",
        description: "",
        is_active: true
    });

    const categories = [
        { label: "Heavy Duty", value: "HEAVY_DUTY" },
        { label: "Fertilizer", value: "FERTILIZER" },
        { label: "Parts", value: "PARTS" },
        { label: "Truck Head", value: "TRUCK_HEAD" },
        { label: "Tipper", value: "TIPPER" },
        { label: "Tractor", value: "TRACTOR" },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch("/api/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                toast.success("Product created successfully");
                router.push("/inventory/products");
            } else {
                const error = await response.json();
                toast.error(error.error || "Failed to create product");
            }
        } catch (error) {
            console.error("Error creating product", error);
            toast.error("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 p-6 bg-slate-50/50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create New Product</h1>
                        <p className="text-sm text-slate-500">Define your product details, pricing and inventory settings.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button 
                            variant="ghost" 
                            className="text-slate-600 hover:bg-slate-100 h-10 px-4 rounded-xl"
                            onClick={() => router.back()}
                        >
                            <X className="mr-2 h-4 w-4" />
                            Cancel
                        </Button>
                        <Button 
                            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white gap-2 px-6 h-10 shadow-md shadow-blue-100 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                            onClick={handleSubmit}
                            disabled={loading || !formData.name || !formData.category}
                        >
                            <Save className="h-4 w-4" />
                            {loading ? "Creating..." : "Save Product"}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Information */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                        <CardHeader className="bg-white border-b border-slate-50">
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
                                    <Package className="h-4 w-4 text-blue-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">Basic Information</CardTitle>
                                    <CardDescription>The core details of your product</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="name" className="text-slate-700 font-medium">Product Name</Label>
                                <Input 
                                    id="name" 
                                    placeholder="e.g. Turbocharger V8 Engine Kit" 
                                    className="h-11 border-slate-200 bg-slate-50/30 focus-visible:bg-white transition-all rounded-xl"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="sku" className="text-slate-700 font-medium flex items-center gap-2">
                                        <Barcode className="h-3 w-3" /> SKU / Serial Number
                                    </Label>
                                    <Input 
                                        id="sku" 
                                        placeholder="MM-HD-102" 
                                        className="h-11 border-slate-200 bg-slate-50/30 focus-visible:bg-white transition-all rounded-xl"
                                        value={formData.sku}
                                        onChange={(e) => setFormData({...formData, sku: e.target.value})}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="category" className="text-slate-700 font-medium flex items-center gap-2">
                                        <Layers className="h-3 w-3" /> Category
                                    </Label>
                                    <Select 
                                        onValueChange={(val) => setFormData({...formData, category: val})}
                                    >
                                        <SelectTrigger className="h-11 border-slate-200 bg-slate-50/30 transition-all rounded-xl">
                                            <SelectValue placeholder="Select Category" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-slate-200">
                                            {categories.map((cat) => (
                                                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description" className="text-slate-700 font-medium flex items-center gap-2">
                                    <Info className="h-3 w-3" /> Description
                                </Label>
                                <Textarea 
                                    id="description" 
                                    placeholder="Detailed product specifications, compatibility, etc." 
                                    className="min-h-[120px] border-slate-200 bg-slate-50/30 focus-visible:bg-white transition-all rounded-xl resize-none"
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                        <CardHeader className="bg-white border-b border-slate-50">
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                                    <DollarSign className="h-4 w-4 text-emerald-600" />
                                </div>
                                <CardTitle className="text-lg text-slate-800">Pricing & Units</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 grid grid-cols-2 gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="unit_price" className="text-slate-700 font-medium">Standard Unit Price (USD)</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                                    <Input 
                                        id="unit_price" 
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00" 
                                        className="h-11 pl-8 border-slate-200 bg-slate-50/30 focus-visible:bg-white transition-all rounded-xl"
                                        value={formData.unit_price}
                                        onChange={(e) => setFormData({...formData, unit_price: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="unit" className="text-slate-700 font-medium">Unit of Measure</Label>
                                <Select 
                                    defaultValue="PCS"
                                    onValueChange={(val) => setFormData({...formData, unit: val})}
                                >
                                    <SelectTrigger className="h-11 border-slate-200 bg-slate-50/30 transition-all rounded-xl">
                                        <SelectValue placeholder="Select Unit" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-slate-200">
                                        <SelectItem value="PCS">Pieces (PCS)</SelectItem>
                                        <SelectItem value="KG">Kilograms (KG)</SelectItem>
                                        <SelectItem value="BOX">Box/Case</SelectItem>
                                        <SelectItem value="L">Liters (L)</SelectItem>
                                        <SelectItem value="KIT">Kit</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Settings */}
                <div className="flex flex-col gap-6">
                    <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                        <CardHeader className="bg-white border-b border-slate-50">
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-lg bg-orange-50 flex items-center justify-center">
                                    <Settings className="h-4 w-4 text-orange-600" />
                                </div>
                                <CardTitle className="text-lg text-slate-800">Inventory Settings</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 grid gap-6">
                            <div className="grid gap-2">
                                <Label className="text-slate-700 font-medium">Tracking Method</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button 
                                        type="button" 
                                        variant={formData.tracking_type === "BATCH" ? "default" : "outline"}
                                        className={`h-14 rounded-xl flex flex-col gap-1 ${formData.tracking_type === "BATCH" ? "bg-slate-900" : "border-slate-200 text-slate-500"}`}
                                        onClick={() => setFormData({...formData, tracking_type: "BATCH"})}
                                    >
                                        <span className="text-xs font-bold uppercase tracking-wide">Batch Tracking</span>
                                        <span className="text-[10px] opacity-70">Bulk Inventory</span>
                                    </Button>
                                    <Button 
                                        type="button" 
                                        variant={formData.tracking_type === "SERIAL" ? "default" : "outline"}
                                        className={`h-14 rounded-xl flex flex-col gap-1 ${formData.tracking_type === "SERIAL" ? "bg-slate-900" : "border-slate-200 text-slate-500"}`}
                                        onClick={() => setFormData({...formData, tracking_type: "SERIAL"})}
                                    >
                                        <span className="text-xs font-bold uppercase tracking-wide">SN Tracking</span>
                                        <span className="text-[10px] opacity-70">Individual Items</span>
                                    </Button>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="reorder_level" className="text-slate-700 font-medium">Reorder Alert Level</Label>
                                <Input 
                                    id="reorder_level" 
                                    type="number"
                                    placeholder="0" 
                                    className="h-11 border-slate-200 bg-slate-50/30 transition-all rounded-xl"
                                    value={formData.reorder_level}
                                    onChange={(e) => setFormData({...formData, reorder_level: e.target.value})}
                                />
                                <p className="text-[11px] text-slate-500 italic">You will be notified when stock falls below this level.</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-blue-100 bg-blue-50/30 rounded-2xl border shadow-none">
                        <CardContent className="p-4 flex gap-3 text-sm text-blue-700 leading-relaxed">
                            <Info className="h-5 w-5 shrink-0" />
                            <p>
                                After creating the product, you must record an initial stock movement to populate the inventory levels.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

