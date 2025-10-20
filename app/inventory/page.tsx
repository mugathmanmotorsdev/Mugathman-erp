"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useauth";

export default function InventoryPage() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    product_id: "",
    product_name: "",
    stock_qty: "",
    unit_price: "",
    category: "",
  });
  //require auth
  useAuth()
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/add-inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) alert("✅ Inventory added successfully!");
      else alert("❌ Failed to add inventory");
    } catch (err) {
      console.error(err);
      alert("❌ Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50">
      <div className="max-w-4xl mx-auto py-10 px-4 bg-white min-h-screen">
        <h1 className="text-2xl font-bold mb-6">Add New Inventory Item</h1>
        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off" noValidate>
          <div>
            <Input
              placeholder="Auto-generated ID"
              name="product_id"
              value={form.product_id}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Input
              placeholder="Product name"
              name="product_name"
              value={form.product_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex gap-5">
              <div className="w-full">
                  <Input
                      type="number"
                      name="stock_qty"
                      value={form.stock_qty}
                      onChange={handleChange}
                      placeholder="Stock quantity"
                      required
                  />
              </div>

              <div className="w-full">
                  <Input
                      type="number"
                      name="unit_price"
                      value={form.unit_price}
                      onChange={handleChange}
                      placeholder="Unit price"
                      required
                  />
              </div>
          </div>
          

          <div>
            <Input
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="Product category"
              required
            />
          </div>

          <Button type="submit" disabled={loading} className="w-52 bg-indigo-700">
            {loading ? "Adding..." : "Add to Inventory"}
          </Button>
        </form>
      </div>
      <Footer />
    </div>
  );
}
