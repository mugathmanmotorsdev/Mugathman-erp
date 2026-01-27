"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  MoreVertical,
  Download,
  ArrowLeftRight,
  Package,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Trash2,
  ChevronDown,
  Filter,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

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

type StockStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" | "NEAR_LIMIT";

export default function InventoryPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    productId: string | null;
    productName: string;
  }>({
    open: false,
    productId: null,
    productName: "",
  });
  const [deleting, setDeleting] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    skip: 0,
    take: 10,
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        skip: pagination.skip.toString(),
        take: pagination.take.toString(),
        search: search,
        category: category,
      });
      const response = await fetch(`/api/products?${query.toString()}`);
      const data = await response.json();
      if (data.products) {
        setProducts(data.products);
        if (data.pagination) setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch products", error);
      toast.error("Failed to load inventory");
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
    setPagination((prev) => ({ ...prev, skip: newSkip }));
  };

  const handleDeleteProduct = async () => {
    if (!deleteDialog.productId) return;

    setDeleting(true);
    try {
      const response = await fetch(
        `/api/products/${deleteDialog.productId}`,
        {
          method: "DELETE",
        }
      );

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
    { label: "Parts", value: "PARTS" },
    { label: "Fertilizer", value: "FERTILIZER" },
    { label: "Heavy Duty", value: "HEAVY_DUTY" },
    { label: "Truck Head", value: "TRUCK_HEAD" },
    { label: "Tipper", value: "TIPPER" },
    { label: "Tractor", value: "TRACTOR" },
  ];

  const getStockStatus = (product: Product): StockStatus => {
    if (product.currentStock === 0) return "OUT_OF_STOCK";
    if (product.currentStock <= product.reorder_level * 0.5) return "LOW_STOCK";
    if (product.currentStock <= product.reorder_level) return "NEAR_LIMIT";
    return "IN_STOCK";
  };

  const getStatusBadge = (status: StockStatus) => {
    const config = {
      IN_STOCK: {
        color: "bg-emerald-500",
        text: "text-emerald-600",
        label: "In Stock",
        icon: null,
      },
      LOW_STOCK: {
        color: "bg-red-500",
        text: "text-red-600",
        label: "LOW STOCK",
        icon: <AlertTriangle className="h-3.5 w-3.5" />,
        badgeBg: "bg-red-50 border-red-100",
      },
      OUT_OF_STOCK: {
        color: "bg-slate-400",
        text: "text-slate-500",
        label: "Out of Stock",
        icon: null,
      },
      NEAR_LIMIT: {
        color: "bg-amber-500",
        text: "text-amber-600",
        label: "Near Limit",
        icon: null,
      },
    };
    const cfg = config[status];

    if (status === "LOW_STOCK") {
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 border border-red-100 rounded-md">
          <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
          <span className="text-red-600 text-xs font-bold uppercase tracking-wide">
            {cfg.label}
          </span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${cfg.color}`}></span>
        <span className={`${cfg.text} text-sm font-medium`}>{cfg.label}</span>
      </div>
    );
  };

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      PARTS: "bg-indigo-100 text-indigo-700 border-indigo-200",
      FERTILIZER: "bg-emerald-100 text-emerald-700 border-emerald-200",
      HEAVY_DUTY: "bg-amber-100 text-amber-700 border-amber-200",
      TRUCK_HEAD: "bg-blue-100 text-blue-700 border-blue-200",
      TIPPER: "bg-purple-100 text-purple-700 border-purple-200",
      TRACTOR: "bg-rose-100 text-rose-700 border-rose-200",
    };
    const style = colors[category] || "bg-slate-100 text-slate-700 border-slate-200";
    return (
      <Badge
        variant="outline"
        className={`${style} px-2.5 py-0.5 font-bold text-[10px] uppercase tracking-wider rounded-md border shadow-none`}
      >
        {category.replace("_", " ")}
      </Badge>
    );
  };

  // Calculate stats
  const totalStockValue = products.reduce(
    (acc, p) => acc + p.currentStock * p.unit_price,
    0
  );
  const lowStockCount = products.filter(
    (p) => getStockStatus(p) === "LOW_STOCK" || getStockStatus(p) === "OUT_OF_STOCK"
  ).length;
  const healthScore = products.length > 0
    ? Math.round(
        ((products.length - lowStockCount) / products.length) * 100
      )
    : 100;

  // Filter products based on status
  const filteredProducts = products.filter((product) => {
    if (statusFilter === "all") return true;
    const status = getStockStatus(product);
    if (statusFilter === "IN_STOCK") return status === "IN_STOCK";
    if (statusFilter === "LOW_STOCK") return status === "LOW_STOCK";
    if (statusFilter === "OUT_OF_STOCK") return status === "OUT_OF_STOCK";
    return true;
  });

  const currentPage = Math.floor(pagination.skip / pagination.take) + 1;
  const totalPages = Math.ceil(pagination.total / pagination.take);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Header Section */}
        <div className="flex flex-col gap-1 mb-6">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h1 className="text-[32px] font-bold text-slate-900 tracking-tight">
                Product Catalog
              </h1>
              <p className="text-slate-500 text-[15px] max-w-lg">
                Centralized oversight for fleet components, maintenance parts, and
                industrial chemical supplies.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/inventory/products">
                <Button 
                variant="outline"
                className="h-11 px-5 gap-2.5 text-[#150150] font-semibold rounded-xl">
                  All Products
                </Button>
              </Link>
              <Link href="/inventory/movements/new">
                <Button className="h-11 px-5 gap-2.5 bg-[#150150] hover:bg-[#150150]/80 text-white font-semibold rounded-xl shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5">
                  <ArrowLeftRight className="h-4 w-4" />
                  Stock In/Out
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[320px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Search by SKU, product name or serial number..."
                className="pl-12 h-12 bg-slate-50/50 border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-indigo-200 focus-visible:bg-white transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Category Filters */}
            <div className="flex items-center gap-2">
              <Button
                variant={category === "all" ? "default" : "outline"}
                className={`h-10 px-4 rounded-full font-semibold text-sm transition-all ${
                  category === "all"
                    ? "bg-[#150150] text-white shadow-md"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
                onClick={() => setCategory("all")}
              >
                All Categories
                <ChevronDown className="h-4 w-4 ml-1.5" />
              </Button>
              <Button
                variant={category === "PARTS" ? "default" : "outline"}
                className={`h-10 px-4 rounded-full font-medium text-sm transition-all ${
                  category === "PARTS"
                    ? "bg-slate-900 text-white"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
                onClick={() => setCategory("PARTS")}
              >
                Parts
                <ChevronDown className="h-4 w-4 ml-1.5" />
              </Button>
              <Button
                variant={category === "FERTILIZER" ? "default" : "outline"}
                className={`h-10 px-4 rounded-full font-medium text-sm transition-all ${
                  category === "FERTILIZER"
                    ? "bg-slate-900 text-white"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
                onClick={() => setCategory("FERTILIZER")}
              >
                Fertilizer
                <ChevronDown className="h-4 w-4 ml-1.5" />
              </Button>
              <Button
                variant={category === "HEAVY_DUTY" ? "default" : "outline"}
                className={`h-10 px-4 rounded-full font-medium text-sm transition-all ${
                  category === "HEAVY_DUTY"
                    ? "bg-slate-900 text-white"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
                onClick={() => setCategory("HEAVY_DUTY")}
              >
                Accessories
                <ChevronDown className="h-4 w-4 ml-1.5" />
              </Button>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-3 ml-auto">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px] h-10 border-slate-200 rounded-full text-sm font-medium bg-white shadow-none">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-slate-400" />
                    <SelectValue placeholder="Status: All" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all" className="font-medium">
                    All Status
                  </SelectItem>
                  <SelectItem value="IN_STOCK" className="font-medium">
                    In Stock
                  </SelectItem>
                  <SelectItem value="LOW_STOCK" className="font-medium">
                    Low Stock
                  </SelectItem>
                  <SelectItem value="OUT_OF_STOCK" className="font-medium">
                    Out of Stock
                  </SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-slate-500">
                Displaying <span className="font-semibold text-slate-700">{pagination.total}</span> items
              </span>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/60 border-b border-slate-100">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[120px] text-[12px] font-bold text-slate-500 uppercase tracking-[0.08em] py-4 pl-6">
                    SKU
                  </TableHead>
                  <TableHead className="text-[12px] font-bold text-slate-500 uppercase tracking-[0.08em] py-4">
                    Product Name
                  </TableHead>
                  <TableHead className="text-[12px] font-bold text-slate-500 uppercase tracking-[0.08em] py-4">
                    Category
                  </TableHead>
                  <TableHead className="text-[12px] font-bold text-slate-500 uppercase tracking-[0.08em] py-4 text-center">
                    Stock
                  </TableHead>
                  <TableHead className="text-[12px] font-bold text-slate-500 uppercase tracking-[0.08em] py-4 text-center">
                    Reorder Level
                  </TableHead>
                  <TableHead className="text-[12px] font-bold text-slate-500 uppercase tracking-[0.08em] py-4">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="border-b border-slate-50">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <TableCell key={j} className="py-5">
                          <Skeleton className="h-5 w-full rounded-md" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-48 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                          <Package className="h-8 w-8" />
                        </div>
                        <p className="text-slate-600 font-semibold">No products found</p>
                        <p className="text-slate-400 text-sm">Try adjusting your filters or search query</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => {
                    const status = getStockStatus(product);
                    return (
                      <TableRow
                        key={product.id}
                        className="group hover:bg-indigo-50/30 border-b border-slate-50 transition-colors"
                      >
                        <TableCell className="py-5 pl-6">
                          <span className="font-mono text-sm font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded">
                            {product.sku || "N/A"}
                          </span>
                        </TableCell>
                        <TableCell className="py-5">
                          <span className="font-semibold text-slate-900">
                            {product.name}
                          </span>
                        </TableCell>
                        <TableCell className="py-5">
                          {getCategoryBadge(product.category)}
                        </TableCell>
                        <TableCell className="py-5 text-center">
                          <span
                            className={`font-bold text-lg ${
                              status === "LOW_STOCK" || status === "OUT_OF_STOCK"
                                ? "text-red-600"
                                : "text-slate-900"
                            }`}
                          >
                            {product.currentStock}
                          </span>
                        </TableCell>
                        <TableCell className="py-5 text-center">
                          <span className="text-slate-500 font-medium">
                            {product.reorder_level}
                          </span>
                        </TableCell>
                        <TableCell className="py-5">
                          {getStatusBadge(status)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/30">
            <p className="text-sm text-slate-500">
              Showing{" "}
              <span className="font-semibold text-slate-700">
                {Math.min(pagination.skip + 1, pagination.total)}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-slate-700">
                {Math.min(pagination.skip + pagination.take, pagination.total)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-700">{pagination.total}</span>{" "}
              results
            </p>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-lg border-slate-200"
                onClick={() =>
                  handlePageChange(Math.max(0, pagination.skip - pagination.take))
                }
                disabled={pagination.skip === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  let pageNum = i + 1;
                  // Smart pagination display
                  if (totalPages > 5) {
                    if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                  }
                  if (pageNum < 1 || pageNum > totalPages) return null;
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      className={`h-9 w-9 rounded-lg ${
                        currentPage === pageNum
                          ? "bg-[#150150] text-white shadow-sm"
                          : "border-slate-200 text-slate-600"
                      }`}
                      onClick={() => handlePageChange((pageNum - 1) * pagination.take)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <>
                    <span className="text-slate-400 px-1">...</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 w-9 rounded-lg border-slate-200 text-slate-600"
                      onClick={() => handlePageChange((totalPages - 1) * pagination.take)}
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-lg border-slate-200"
                onClick={() => handlePageChange(pagination.skip + pagination.take)}
                disabled={pagination.skip + pagination.take >= pagination.total}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Footer Stats Section */}
      <div className="border-t border-slate-200 bg-white px-6 py-5">
        <div className="flex items-center justify-between">
          {/* Stats */}
          <div className="flex items-center gap-20">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Stock Value
              </span>
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                  minimumFractionDigits: 2,
                }).format(totalStockValue)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Low Stock Alerts
              </span>
              <span className="text-2xl font-black text-red-500 tracking-tight">
                {lowStockCount} Items
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Inventory Health Score
            </span>
            <div className="flex items-center gap-3">
              <div className="w-32 h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-500"
                  style={{ width: `${healthScore}%` }}
                />
              </div>
              <span className="text-lg font-bold text-indigo-600">
                {healthScore}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
      >
        <DialogContent className="sm:max-w-md rounded-2xl border-slate-200">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete Product
            </DialogTitle>
            <DialogDescription className="pt-2">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-slate-900">
                {deleteDialog.productName}
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() =>
                setDeleteDialog({ open: false, productId: null, productName: "" })
              }
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
