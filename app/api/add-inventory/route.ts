// app/api/add-inventory/route.ts
import { googleAuth } from "@/lib/googleAuth";
import { google } from "googleapis";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { product_id, product_name, stock_qty, unit_price, category } = body;

    const auth = await googleAuth("https://www.googleapis.com/auth/spreadsheets")

    const sheets = google.sheets({ version: "v4", auth });

    const spreadsheetId = process.env.GOOGLE_SHEET_ID!;

    const values = [
      [
        product_id,
        product_name,
        stock_qty,
        unit_price,
        category,
        new Date().toLocaleString(), // Last_Updated
      ],
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Inventory!A2:F",
      valueInputOption: "USER_ENTERED",
      requestBody: { values },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Error adding inventory:", error);
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
}
