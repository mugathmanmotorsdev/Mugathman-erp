import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";

import { Product } from "@/types/product";

export function useFetchProduct() {
    const searchParams = useSearchParams();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState(searchParams.get("search") || "");
    const [category, setCategory] = useState(searchParams.get("category") || "all");
    const [pagination, setPagination] = useState({
        total: 0,
        skip: 0,
        take: 10,
    });

    // Debounce search and category for API calls
    const debouncedSearch = useDebounce(search, 300);
    const debouncedCategory = useDebounce(category, 300);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
        const query = new URLSearchParams({
            skip: pagination.skip.toString(),
            take: pagination.take.toString(),
            search: debouncedSearch,
            category: debouncedCategory,
        });
        const response = await fetch(`/api/products?${query.toString()}`, {
            credentials: "include",
        });
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        const data = await response.json();
        if (data.products) {
            setProducts(data.products);
            if (data.pagination) {
                setPagination((prev) => {
                    if (
                        prev.total === data.pagination.total &&
                        prev.skip === data.pagination.skip &&
                        prev.take === data.pagination.take
                    ) {
                        return prev;
                    }
                    return data.pagination;
                });
            }
        }
        } catch (error) {
        console.error("Failed to fetch products", error);
        setError(error instanceof Error ? error.message : "Failed to load inventory");
        toast.error("Failed to load inventory");
        } finally {
        setLoading(false);
        }
    }, [pagination, debouncedSearch, debouncedCategory]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // Sync search/category to URL
    useEffect(() => {
        const params = new URLSearchParams();
        if (search && search !== "all") params.set("search", search);
        if (category && category !== "all") params.set("category", category);
        const newUrl = params.toString()
            ? `${window.location.pathname}?${params.toString()}`
            : window.location.pathname;
        window.history.replaceState(null, "", newUrl);
    }, [search, category]);

    return {
        products,
        loading,
        error,
        search,
        setSearch,
        category,
        setCategory,
        pagination,
        fetchProducts,
        setPagination,
    };
}