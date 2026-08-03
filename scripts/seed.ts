import "dotenv/config";
import { PrismaClient, Category } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "@/lib/utils/password";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // -------------------------------------------------------
  // 1. Admin User
  // -------------------------------------------------------
  const adminEmail = "admin@mugathmanmotors.com";
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existingAdmin) {
    const hashedPassword = await hashPassword("admin1234");
    await prisma.user.create({
      data: {
        full_name: "Admin User",
        email: adminEmail,
        password: hashedPassword,
        role: "ADMIN",
        status: "ACTIVE",
      },
    });
    console.log("✅ Admin user created");
  } else {
    console.log("ℹ️  Admin user already exists, skipping");
  }

  // -------------------------------------------------------
  // 2. Sample Customers
  // -------------------------------------------------------
  const customers = [
    { full_name: "Ahmed Al-Rashid", phone: "+2348012345678", email: "ahmed@example.com", address: "12 Kano Road, Kumbotso, Kano" },
    { full_name: "Fatima Musa", phone: "+2348023456789", email: "fatima@example.com", address: "45 Zaria Road, Kano" },
    { full_name: "Ibrahim Yakubu", phone: "+2348034567890", email: "ibrahim@example.com", address: "78 Murtala Mohammed Way, Kano" },
    { full_name: "Amina Bello", phone: "+2348045678901", email: "amina@example.com", address: "23 Bauchi Road, Kano" },
    { full_name: "Yusuf Abdullahi", phone: "+2348056789012", email: "yusuf@example.com", address: "56 Kaduna Road, Kano" },
  ];

  for (const customer of customers) {
    const existing = await prisma.customer.findUnique({ where: { phone: customer.phone } });
    if (!existing) {
      await prisma.customer.create({ data: customer });
      console.log(`✅ Customer created: ${customer.full_name}`);
    } else {
      console.log(`ℹ️  Customer already exists: ${customer.full_name}`);
    }
  }

  // -------------------------------------------------------
  // 3. Sample Products (BATCH tracked)
  // -------------------------------------------------------
  const batchProducts = [
    { name: "Toyota Spare Tire", sku: "TOY-TIRE-001", category: Category.PARTS, unit_price: 15000, unit: "piece", tracking_type: "BATCH" as const, reorder_level: 10, description: "Genuine Toyota spare tire for Hiace and Land Cruiser models" },
    { name: "Engine Oil 20W-50", sku: "ENG-OIL-20W", category: Category.PARTS, unit_price: 3500, unit: "liter", tracking_type: "BATCH" as const, reorder_level: 20, description: "Premium engine oil 20W-50 for diesel engines" },
    { name: "Brake Pad Set", sku: "BRK-PAD-001", category: Category.PARTS, unit_price: 8500, unit: "set", tracking_type: "BATCH" as const, reorder_level: 15, description: "Brake pad set for light commercial vehicles" },
    { name: "Diesel Fuel Filter", sku: "DFL-200", category: Category.PARTS, unit_price: 4200, unit: "piece", tracking_type: "BATCH" as const, reorder_level: 25, description: "Primary diesel fuel filter for truck engines" },
    { name: "NPK Fertilizer 50kg", sku: "FERT-NPK-50", category: Category.FERTILIZER, unit_price: 5500, unit: "bag", tracking_type: "BATCH" as const, reorder_level: 5, description: "NPK compound fertilizer 50kg bag for crops" },
    { name: "Urea Fertilizer 50kg", sku: "FERT-UREA-50", category: Category.FERTILIZER, unit_price: 4800, unit: "bag", tracking_type: "BATCH" as const, reorder_level: 5, description: "Granular urea fertilizer 50kg bag" },
  ];

  for (const product of batchProducts) {
    const existing = await prisma.product.findUnique({ where: { sku: product.sku } });
    if (!existing) {
      await prisma.product.create({ data: product });
      console.log(`✅ Product created: ${product.name}`);
    } else {
      console.log(`ℹ️  Product already exists: ${product.name}`);
    }
  }

  // -------------------------------------------------------
  // 4. Sample Products (SERIAL tracked)
  // -------------------------------------------------------
  const serialProducts = [
    { name: "Toyota Hiace Van (2023)", sku: "TOY-HIACE-2023", category: Category.TRUCK_HEAD, unit_price: 25000000, unit: "piece", tracking_type: "SERIAL" as const, reorder_level: 0, description: "Toyota Hiace 2023 model, white, 13-seater" },
    { name: "Hino Truck Head", sku: "HINO-TH-2024", category: Category.TRUCK_HEAD, unit_price: 45000000, unit: "piece", tracking_type: "SERIAL" as const, reorder_level: 0, description: "Hino FH series truck head, 2024 model" },
    { name: "Mitsubishi Tipper", sku: "MITS-TIP-2023", category: Category.TIPPER, unit_price: 18000000, unit: "piece", tracking_type: "SERIAL" as const, reorder_level: 0, description: "Mitsubishi L200 tipper, 2023 model" },
    { name: "Iveco Tractor Head", sku: "IVECO-TR-2023", category: Category.TRACTOR, unit_price: 35000000, unit: "piece", tracking_type: "SERIAL" as const, reorder_level: 0, description: "Iveco Tector tractor head, 2023 model" },
  ];

  for (const product of serialProducts) {
    const existing = await prisma.product.findUnique({ where: { sku: product.sku } });
    if (!existing) {
      await prisma.product.create({ data: product });
      console.log(`✅ Product created: ${product.name}`);
    } else {
      console.log(`ℹ️  Product already exists: ${product.name}`);
    }
  }

  // -------------------------------------------------------
  // 5. Sample Vehicles (for SERIAL products)
  // -------------------------------------------------------
  const vehicles = [
    { product_sku: "TOY-HIACE-2023", vin: "VIN-TOY-HI-001", color: "White" },
    { product_sku: "TOY-HIACE-2023", vin: "VIN-TOY-HI-002", color: "White" },
    { product_sku: "HINO-TH-2024", vin: "VIN-HINO-TH-001", color: "Silver" },
    { product_sku: "MITS-TIP-2023", vin: "VIN-MITS-TIP-001", color: "Red" },
    { product_sku: "IVECO-TR-2023", vin: "VIN-IVECO-TR-001", color: "Blue" },
    { product_sku: "IVECO-TR-2023", vin: "VIN-IVECO-TR-002", color: "White" },
  ];

  for (const v of vehicles) {
    const product = await prisma.product.findUnique({ where: { sku: v.product_sku } });
    if (!product) {
      console.warn(`⚠️  Product not found for SKU ${v.product_sku}, skipping vehicle ${v.vin}`);
      continue;
    }
    const existing = await prisma.vehicle.findUnique({ where: { vin: v.vin } });
    if (!existing) {
      await prisma.vehicle.create({
        data: { product_id: product.id, vin: v.vin, color: v.color, status: "AVAILABLE" },
      });
      console.log(`✅ Vehicle created: ${v.vin} (${v.color})`);
    } else {
      console.log(`ℹ️  Vehicle already exists: ${v.vin}`);
    }
  }

  // -------------------------------------------------------
  // 6. Initial Stock Movements (BATCH products)
  // -------------------------------------------------------
  const adminUser = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!adminUser) {
    console.error("❌ Admin user not found, cannot create stock movements");
    return;
  }

  const batchMovements = [
    // Stock IN for all batch products
    { product_sku: "TOY-TIRE-001", qty_in: 50, qty_out: 12 },
    { product_sku: "ENG-OIL-20W", qty_in: 100, qty_out: 30 },
    { product_sku: "BRK-PAD-001", qty_in: 40, qty_out: 8 },
    { product_sku: "DFL-200", qty_in: 60, qty_out: 15 },
    { product_sku: "FERT-NPK-50", qty_in: 100, qty_out: 20 },
    { product_sku: "FERT-UREA-50", qty_in: 80, qty_out: 15 },
  ];

  for (const m of batchMovements) {
    const product = await prisma.product.findUnique({ where: { sku: m.product_sku } });
    if (!product) continue;

    // Stock IN
    await prisma.stockMovement.create({
      data: {
        product_id: product.id,
        quantity: m.qty_in,
        type: "IN",
        reason: "PURCHASE",
        performed_by: adminUser.id,
      },
    });

    // Stock OUT
    await prisma.stockMovement.create({
      data: {
        product_id: product.id,
        quantity: -m.qty_out,
        type: "OUT",
        reason: "SALE",
        performed_by: adminUser.id,
      },
    });
  }
  console.log("✅ Batch stock movements created");

  // -------------------------------------------------------
  // 7. Stock IN for SERIAL vehicles
  // -------------------------------------------------------
  for (const v of vehicles) {
    const product = await prisma.product.findUnique({ where: { sku: v.product_sku } });
    if (!product) continue;

    const vehicle = await prisma.vehicle.findUnique({ where: { vin: v.vin } });
    if (!vehicle) continue;

    await prisma.stockMovement.create({
      data: {
        product_id: product.id,
        vehicle_id: vehicle.id,
        quantity: 1,
        type: "IN",
        reason: "PURCHASE",
        performed_by: adminUser.id,
      },
    });
  }
  console.log("✅ Serial vehicle stock movements created");

  // -------------------------------------------------------
  // 8. Sample Leads
  // -------------------------------------------------------
  const leads = [
    { full_name: "Sani Musa", email: "sani@email.com", phone: "+2348061111111", organization: "Musa Motors Kano", product_of_interest: "Truck Head", message: "Interested in purchasing 2 Hino truck heads for our fleet." },
    { full_name: "Grace Ejike", email: "grace@email.com", phone: "+2348072222222", organization: null, product_of_interest: "Spare Parts", message: "Looking for Toyota spare tires in bulk." },
    { full_name: "Muhammad Ali", email: "muhammad@email.com", phone: "+2348083333333", organization: "Ali Transport Ltd", product_of_interest: "Tipper", message: "Need to replace 3 Mitsubishi tipper beds." },
  ];

  for (const lead of leads) {
    const existing = await prisma.lead.findFirst({ where: { email: lead.email } });
    if (!existing) {
      await prisma.lead.create({ data: lead });
      console.log(`✅ Lead created: ${lead.full_name}`);
    } else {
      console.log(`ℹ️  Lead already exists: ${lead.full_name}`);
    }
  }

  console.log("\n🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
