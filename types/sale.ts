export interface Sale {
  id: string;
  sale_number: string;
  customer: {
    full_name: string;
    phone: string;
    address: string | null;
    email: string | null;
  };
  user: {
    full_name: string;
  };
  status: string;
  created_at: string | Date;
  sale_items: Array<{
    id: string;
    quantity: number;
    unit_price: any;
    product: {
      name: string;
    };
  }>;
}