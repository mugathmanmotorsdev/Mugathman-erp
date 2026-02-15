import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Product } from "@/types/product";

export function useFetchProduct() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("all");
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

    return {
        products,
        loading,
        search,
        setSearch,
        category,
        setCategory,
        pagination,
        fetchProducts,
        setPagination
    };
}