import { requireAuth } from "@/lib/utils/auth-utils";
import { NextRequest, NextResponse } from "next/server";
import { getSale, getSales } from "@/lib/actions/sales";
import prisma from "@/lib/prisma";
import { sendWhatsappThankMsg, uploadMedia } from "@/lib/services/whatsapp";
import { generateReceipt } from "@/lib/services/receipt-generator";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const skip = Number(searchParams.get("skip")) || 0;
  const take = Number(searchParams.get("take")) || 10;

  try {
    await requireAuth();
    const sales = await getSales(skip, take);
    return NextResponse.json(sales);
  } catch (error) {
    console.error("Error fetching sales:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { customer_id, customer_details, items, status = "COMPLETED" } = body;

    if (
      (!customer_id && !customer_details) ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        { error: "Missing required fields: customer info and items" },
        { status: 400 },
      );
    }

    //check stock availability
    for (const item of items) {
      const { product_id, quantity, vehicle_id } = item;
      const stock = await prisma.stockMovement.aggregate({
        _sum: {
          quantity: true,
        },
        where: {
          product_id,
          vehicle_id: vehicle_id || null,
        },
      });
      if ((stock._sum.quantity ?? 0) < quantity) {
        return NextResponse.json(
          { error: "Insufficient stock" },
          { status: 400 },
        );
      }
    }

    // Generate sale number (e.g., SALE-20240127-001)
    const date = new Date();
    const dateString = date.toISOString().slice(0, 10).replace(/-/g, "");
    const count = await prisma.sale.count({
      where: {
        created_at: {
          gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
        },
      },
    });
    const sale_number = `SALE-${dateString}-${(count + 1).toString().padStart(3, "0")}`;

    const result = await prisma.$transaction(async (tx) => {
      let final_customer_id = customer_id;

      // 1. Create Customer if details provided
      if (!final_customer_id && customer_details) {
        // Check if customer with phone exists
        const existing = await tx.customer.findUnique({
          where: { phone: customer_details.phone },
        });

        if (existing) {
          final_customer_id = existing.id;
        } else {
          const newCustomer = await tx.customer.create({
            data: {
              full_name: customer_details.full_name,
              phone: customer_details.phone,
              email: customer_details.email,
              address: customer_details.address,
            },
          });
          final_customer_id = newCustomer.id;
        }
      }

      // 2. Create the Sale
      const sale = await tx.sale.create({
        data: {
          sale_number,
          customer_id: final_customer_id,
          created_by: user.id,
          status: status,
        },
      });

      // 2. Process each SaleItem
      for (const item of items) {
        const { product_id, quantity, unit_price, vehicle_id, location_id } =
          item;

        // Create SaleItem
        await tx.saleItem.create({
          data: {
            sale_id: sale.id,
            product_id,
            quantity: Number(quantity),
            unit_price: Number(unit_price),
          },
        });

        // Create StockMovement (Deduction)
        const movement = await tx.stockMovement.create({
          data: {
            product_id,
            location_id,
            vehicle_id: vehicle_id || null,
            quantity: -Math.abs(Number(quantity)),
            type: "OUT",
            reason: "SALE",
            reference_type: "SALE",
            reference_id: sale.id,
            performed_by: user.id,
          },
        });

        // If it's a vehicle (serialized product), update vehicle status
        if (vehicle_id) {
          await tx.vehicle.update({
            where: { id: vehicle_id },
            data: {
              status: "SOLD",
            },
          });

          // Optional: Link movement to vehicle if not already done by prisma schema relations
          // Actually, stock_movement already has vehicle_id.
        }
      }

      return sale;
    });

    const sale = await getSale(result.id);
    // calculate total amount
    const totalAmount = sale?.sale_items.reduce(
      (acc, item) =>
        acc + Number(item?.product?.unit_price || 0) * item.quantity,
      0,
    );

    // generate pdf
    const pdfBuffer = await generateReceipt(sale?.id || "");

    // upload pdf to whatsapp
    const media = await uploadMedia(pdfBuffer, `${sale?.sale_number}.pdf`);
    // send whatsapp thank message
    await sendWhatsappThankMsg(
      sale?.customer?.full_name || "",
      sale?.customer?.phone || "",
      sale?.sale_number || "",
      totalAmount || 0,
      media?.id || "",
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error creating sale:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
