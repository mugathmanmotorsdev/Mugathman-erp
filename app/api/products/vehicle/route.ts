import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    try {
        const vehicles = await prisma.vehicle.findMany({
            where: {
                status: "AVAILABLE",
            }
        })

        return NextResponse.json(vehicles);
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        console.log("body: ", body);
        const { product_id, inventory_location_id, vin } = body;
        if (!product_id || !inventory_location_id || !vin) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // check if product exists
        const product = await prisma.product.findUnique({
            where: {
                id: product_id,
            }
        })
        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        // check if inventory location exists
        const inventory_location = await prisma.inventoryLocation.findUnique({
            where: {
                id: inventory_location_id,
            }
        })
        if (!inventory_location) {
            return NextResponse.json({ error: "Inventory location not found" }, { status: 404 });
        }

        // check if vin exists
        const vehicleExists = await prisma.vehicle.findUnique({
            where: {
                vin,
            }
        })
        if (vehicleExists) {
            return NextResponse.json({ error: "Vehicle with this VIN already exists" }, { status: 400 });
        }

        // create vehicle
        const vehicle = await prisma.vehicle.create({
            data: {
                product_id,
                inventory_location_id,
                vin,
                status: "AVAILABLE",
            }
        })
        return NextResponse.json(vehicle);
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
