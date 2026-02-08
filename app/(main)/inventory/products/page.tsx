"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
    Search, 
    Plus, 
    MoreHorizontal, 
    Filter, 
    ChevronLeft, 
    ChevronRight,
    Package,
    AlertTriangle,
    CheckCircle2,
    X,
    Pencil,
    Trash2,
    Eye
} from "lucide-react";
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface Product {
    id: string;
    name: string;
    sku: string | null;
    category: string;
    unit_price: number;
    currentStock: number;
    reorder_level: number;
    is_active: boolean;
}

export default function ProductsPage() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("all");
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; productId: string | null; productName: string }>({
        open: false,
        productId: null,
        productName: ""
    });
    const [deleting, setDeleting] = useState(false);
    const [pagination, setPagination] = useState({
        total: 0,
        skip: 0,
        take: 10
    });

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                skip: pagination.skip.toString(),
                take: pagination.take.toString(),
                search: search,
                category: category
            });
            const response = await fetch(`/api/products?${query.toString()}`);
            const data = await response.json();
            if (data.products) {
                setProducts(data.products);
                if (data.pagination) setPagination(data.pagination);
            }
        } catch (error) {
            console.error("Failed to fetch products", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProducts();
        }, 300);
        return () => clearTimeout(timer);
    }, [search, category, pagination.skip]);

    const handlePageChange = (newSkip: number) => {
        setPagination(prev => ({ ...prev, skip: newSkip }));
    };

    const handleDeleteProduct = async () => {
        if (!deleteDialog.productId) return;

        setDeleting(true);
        try {
            const response = await fetch(`/api/products/${deleteDialog.productId}`, {
                method: "DELETE"
            });

            if (response.ok) {
                toast.success("Product deleted successfully");
                setDeleteDialog({ open: false, productId: null, productName: "" });
                fetchProducts();
            } else {
                const error = await response.json();
                toast.error(error.error || "Failed to delete product");
            }
        } catch (error) {
            console.error("Error deleting product", error);
            toast.error("An unexpected error occurred");
        } finally {
            setDeleting(false);
        }
    };

    const categories = [
        { label: "All Categories", value: "all" },
        { label: "Heavy Duty", value: "HEAVY_DUTY" },
        { label: "Fertilizer", value: "FERTILIZER" },
        { label: "Parts", value: "PARTS" },
        { label: "Truck Head", value: "TRUCK_HEAD" },
        { label: "Tipper", value: "TIPPER" },
        { label: "Tractor", value: "TRACTOR" },
        { label: "Dozer", value: "DOZER" },
    ];

    return (
        <div className="flex flex-col gap-6 p-6 bg-[#EFF3F4] min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Product Catalog</h1>
                    <Link href="/inventory/products/new">
                        <Button className="bg-[#150150] hover:bg-[#150150]/80 text-white gap-2 px-4 shadow-sm">
                            <Plus className="h-4 w-4" />
                            Add New Product
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Filters Section */}
            <div className="grid grid-cols-1 md:flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="relative flex-1 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#150150] transition-colors" />
                    <Input 
                        placeholder="Search by SKU, Name or Category..." 
                        className="pl-10 bg-slate-50/50 border-slate-200 focus-visible:ring-[#150150] focus-visible:bg-white transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3">
                    <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="w-[180px] bg-slate-50/50 border-slate-200">
                            <SelectValue placeholder="Category: All" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map((cat) => (
                                <SelectItem key={cat.value} value={cat.value}>
                                    {cat.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select defaultValue="all">
                        <SelectTrigger className="w-[180px] bg-slate-50/50 border-slate-200 text-slate-600">
                            <SelectValue placeholder="Warehouse: All" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Warehouse: All</SelectItem>
                            <SelectItem value="main">Main Warehouse</SelectItem>
                            <SelectItem value="sector-g">Sector-G</SelectItem>
                        </SelectContent>
                    </Select>

                    <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 border border-red-100 rounded-full text-xs font-semibold uppercase tracking-wider">
                        Status: Low Stock
                        <X className="h-3 w-3 cursor-pointer hover:bg-red-100 rounded-full transition-colors" />
                    </div>

                    <Button variant="outline" className="gap-2 border-slate-200 text-slate-600 hover:bg-slate-50">
                        <Filter className="h-4 w-4" />
                        More Filters
                    </Button>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow>
                            <TableHead className="w-[120px] text-xs font-bold text-slate-500 uppercase tracking-wider pl-6">SKU</TableHead>
                            <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider">Product Name</TableHead>
                            <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider">Category</TableHead>
                            <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider">Warehouse</TableHead>
                            <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reorder Level</TableHead>
                            <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider">Unit Price</TableHead>
                            <TableHead className="w-[60px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    {Array.from({ length: 7 }).map((_, j) => (
                                        <TableCell key={j} className="py-4">
                                            <Skeleton className="h-5 w-full rounded-md" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : products.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-40 text-center">
                                    <div className="flex flex-col items-center gap-2 text-slate-500">
                                        <Package className="h-10 w-10 text-slate-200" />
                                        <p>No products found matching your criteria</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            products.map((product) => (
                                <TableRow key={product.id} className="group hover:bg-slate-50/50 transition-colors">
                                    <TableCell className="font-mono text-sm text-slate-500 pl-6 border-l-2 border-transparent group-hover:border-blue-500">
                                        {product.sku || "N/A"}
                                    </TableCell>
                                    <TableCell className="py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:shadow-sm transition-all border border-transparent group-hover:border-slate-200">
                                                <Package className="h-5 w-5" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-slate-900">{product.name}</span>
                                                <span className="text-xs text-slate-500">Standard Unit: {product.unit_price > 1000 ? "Bulk" : "Retail"}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="bg-[#150150] text-white hover:bg-[#150150]/80 border-none font-semibold px-2.5 py-0.5 rounded-md uppercase text-[10px] tracking-wide">
                                            {product.category.replace('_', ' ')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm text-slate-600">
                                        Main Warehouse
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span className={`font-bold ${product.currentStock <= product.reorder_level ? "text-orange-600" : "text-slate-900"}`}>
                                                {product.reorder_level} units
                                            </span>
                                            {product.currentStock <= product.reorder_level && (
                                                <div className="flex items-center gap-1 px-2 py-0.5 bg-orange-50 text-orange-700 rounded text-[10px] font-bold uppercase tracking-wider border border-orange-100">
                                                    <AlertTriangle className="h-3 w-3" />
                                                    Alert
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-bold text-slate-900">
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(product.unit_price)}
                                    </TableCell>
                                    <TableCell className="pr-6 text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900 transition-colors">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-40 border-slate-200 shadow-lg rounded-xl">
                                                <DropdownMenuItem 
                                                    className="cursor-pointer gap-2"
                                                    onClick={() => router.push(`/inventory/products/edit/${product.id}`)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                    Edit Product
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="cursor-pointer gap-2">
                                                    <Eye className="h-4 w-4" />
                                                    View Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem 
                                                    className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50 gap-2"
                                                    onClick={() => setDeleteDialog({ open: true, productId: product.id, productName: product.name })}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
                
                {/* Pagination Section */}
                <div className="flex items-center justify-between px-6 py-4 bg-slate-50/30 border-t border-slate-100">
                    <p className="text-sm text-slate-500">
                        Showing <span className="font-medium text-slate-900">{pagination.skip + 1}</span> to <span className="font-medium text-slate-900">{Math.min(pagination.skip + pagination.take, pagination.total)}</span> of <span className="font-medium text-slate-900">{pagination.total}</span> products
                    </p>
                    <div className="flex items-center gap-1.5">
                        <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8 rounded-lg border-slate-200"
                            onClick={() => handlePageChange(Math.max(0, pagination.skip - pagination.take))}
                            disabled={pagination.skip === 0}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center gap-1 mx-1">
                            {Array.from({ length: Math.ceil(pagination.total / pagination.take) }).map((_, i) => (
                                <Button 
                                    key={i}
                                    variant={Math.floor(pagination.skip / pagination.take) === i ? "default" : "outline"}
                                    size="sm"
                                    className={`h-8 w-8 rounded-lg ${Math.floor(pagination.skip / pagination.take) === i ? "bg-[#150150] text-white shadow-sm" : "border-slate-200"}`}
                                    onClick={() => handlePageChange(i * pagination.take)}
                                >
                                    {i + 1}
                                </Button>
                            ))}
                        </div>
                        <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8 rounded-lg border-slate-200"
                            onClick={() => handlePageChange(pagination.skip + pagination.take)}
                            disabled={pagination.skip + pagination.take >= pagination.total}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
                <DialogContent className="sm:max-w-md rounded-2xl border-slate-200">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertTriangle className="h-5 w-5" />
                            Delete Product
                        </DialogTitle>
                        <DialogDescription className="pt-2">
                            Are you sure you want to delete <span className="font-semibold text-slate-900">{deleteDialog.productName}</span>? 
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialog({ open: false, productId: null, productName: "" })}
                            disabled={deleting}
                            className="rounded-xl"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteProduct}
                            disabled={deleting}
                            className="rounded-xl bg-red-600 hover:bg-red-700"
                        >
                            {deleting ? "Deleting..." : "Delete Product"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

