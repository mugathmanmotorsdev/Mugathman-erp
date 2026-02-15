export interface Sale {
  id: string;
  sale_number: string;
  customer: {
    full_name: string;
    phone: string;
    address: string;
    email: string;
  };
  user: {
    full_name: string;
  };
  status: string;
  created_at: string;
  sale_items: Array<{
    id: string;
    quantity: number;
    unit_price: string;
    product: {
      name: string;
    };
  }>;
}