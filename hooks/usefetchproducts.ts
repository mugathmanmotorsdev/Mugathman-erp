import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Product } from "@/types/product";

export function useFetchProduct() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("all");
    const [pagination, setPagination] = useState({
        total: 0,
        skip: 0,
        take: 10,
    });
    const isFetchingRef = useRef(false);

    const fetchProducts = useCallback(async () => {
        if (isFetchingRef.current) return;
        isFetchingRef.current = true;
        setLoading(true);
        setError(null);
        try {
            const query = new URLSearchParams({
                skip: pagination.skip.toString(),
                take: pagination.take.toString(),
                search: search,
                category: category,
            });
            const response = await fetch(`/api/products?${query.toString()}`, {
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }

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
            isFetchingRef.current = false;
        }
    }, [pagination, search, category]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProducts();
        }, 300);
        return () => {
            clearTimeout(timer);
            isFetchingRef.current = false;
        };
    }, [fetchProducts]);

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
