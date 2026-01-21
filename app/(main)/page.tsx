"use client";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useauth";
import { Trash } from "lucide-react";
import { useEffect, useState } from "react";

type item = {
  id: string
  name: string
  quantity: number
  price: number
}

type product = {
  id: string
  name: string
  price: number
  stock: number
  category: string
  lastupdated: string
}

type customer = {
  name: string;
  phone?: string;
  email?: string;
  address?: string
}

export default function SalesPage() {
  //require auth here
  useAuth()

  const [products, setProducts] = useState<product[]>([])
  const [cart, setCart] = useState<item[]>([{id: "", name: "", quantity: 1, price: 0}]);
  const [customer, setCustomer] = useState<customer>({ name: "" });
  const [message, setMessage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("")
  const [salesPerson, setSalesPerson] = useState("")
  const [error, setError] = useState("")
  const [remark, setRemark] = useState("")

  //fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      const res = await fetch("/api/inventory")
      const data = await res.json()

      setProducts(data.data || [])
    }

    fetchProducts()
  }, [])

  const addProduct = () => {
    setCart([...cart, { id: "", name: "", quantity: 1, price: 0 }]);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setMessage("")
    setError("")

    e.preventDefault();
    const res = await fetch("/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        details: {
          customer,
          salesPerson,
          paymentMethod,
          remark
        },
        items: cart
      }),
    });
    const data = await res.json();
    if (!data.success) {
      setError(data.error || "Failed to submit sale");
      return;
    }
    setMessage(`✅ ${data.message} (Transaction ID: ${data.transactionId})`);
    setCart([{ id: "", name: "", quantity: 1, price: 0 }]);
    setCustomer({ ...customer, name: "", phone: "" });
    setSalesPerson("");
    setPaymentMethod("");
    setRemark("");
  };

  return (
    <div className="bg-gray-50">
      <div className="p-6 max-w-4xl mx-auto min-h-screen bg-white">
        <form action="#" onSubmit={handleSubmit} autoComplete="off" noValidate>
          <h1 className="text-2xl font-bold mb-4">Sales Record</h1>

          <Input
            name="name"
            type="text"
            placeholder="Customer Name"
            className="border p-2 w-full mb-3 rounded-md"
            value={customer?.name}
            onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
          />
          <Input
            name="phone_no"
            type="text"
            placeholder="Customer Phone No"
            className="border p-2 w-full mb-3 rounded-md"
            value={customer?.phone}
            onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
          />
          <Input
            name="sales_person"
            type="text"
            placeholder="Sales person"
            className="border p-2 w-full mb-3 rounded-md"
            value={salesPerson}
            onChange={(e) => setSalesPerson(e.target.value )}
          />

          <div>
            <Select
            onValueChange={(val) => {
              setPaymentMethod(val)
            }}
            >
              <SelectTrigger 
              className="w-full my-5 py-5">
                <SelectValue placeholder="Payment Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="transfer">Transfer</SelectItem>
                <SelectItem value="pos">POS</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            {cart.map((item, index) => (
              <div key={index} className="border p-3 mb-3 rounded">
                <Label>Product {index + 1}</Label>
                <Select onValueChange={(val) => {
                  //find a selected product from product by selected product id
                  const {id, name, price } = products.find((product: product) => product.id === val) as product
                  setCart(
                    cart.map((p, i) =>
                      i === index ? { ...p, id: id, name: name, price: price } : p
                    )
                  )
                }}>
                  <SelectTrigger className="w-full my-5 py-5">
                    <SelectValue placeholder="select a Products" />
                  </SelectTrigger>
                  <SelectContent>
                  {
                    products.map((product: product) => (
                        <SelectItem key={product.id} value={product.id}>
                        {product.name} - ₦{product.price}
                        <p className="text-xs text-gray-500">{product.id}</p>
                        </SelectItem>
                    ))
                  }
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="quantity"
                    className="border p-2 flex-1"
                    value={item.quantity}
                    onChange={(e) =>
                      setCart(
                        cart.map((p, i) =>
                          i === index ? { ...p, quantity: Number(e.target.value) } : p
                        )
                      )
                    }
                  />
                  <Input
                    type="number"
                    placeholder="Price"
                    className="border p-2 flex-1"
                    value={item.price}
                    onChange={(e) =>
                      setCart(
                        cart.map((p, i) =>
                          i === index ? { ...p, price: Number(e.target.value) } : p
                        )
                      )
                    }
                  />
                </div> 
                <div className="my-5">
                  <button
                    type="button"
                    className="bg-red-500 text-white px-4 py-2 rounded"
                    onClick={() =>
                      setCart(cart.filter((_, i) => i !== index))
                    }
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="my-5">
            <Textarea 
            placeholder="Enter a remark"
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            ></Textarea>
          </div>
          

          <button
            onClick={addProduct}
            className="bg-gray-200 px-4 py-2 rounded mb-4 mx-2"
            type="button"
          >
            + Add Product
          </button>

          <button 
          type="submit"
            className="bg-indigo-700 text-white px-6 py-2 rounded"
          >
            Submit Sale
          </button>
        </form>
        {error && <p className="mt-4 text-red-600">{error}</p>}
        {message && <p className="mt-4 text-green-600">{message}</p>}
      </div>
      <Footer />
    </div>
  );
}
