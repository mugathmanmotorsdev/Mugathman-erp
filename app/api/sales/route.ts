import { requireAuth } from "@/lib/authutils";
import { googleAuth } from "@/lib/googleAuth";
import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

type item = {
  id: string,
  name: string,
  quantity: number,
  price: number
}

export async function POST(req: NextRequest) {
  try {
    await requireAuth();
    
    const body = await req.json();
    const { details, items } = body; // items = [{ name, quantity, price, id }]

    const transactionId = "T-" + uuidv4().slice(0, 6).toUpperCase();
    const customerId = "C-" + uuidv4().slice(0, 6).toUpperCase();

    const auth = await googleAuth("https://www.googleapis.com/auth/spreadsheets")

    const sheets = google.sheets({ version: "v4", auth });

    const salesRows = items.map((item: item, index: number) => {
      if (!item.quantity || !item.price || !item.name) {
        throw new Error("Quantity and Price are required for all items.");
      }
      return [
        transactionId,
        `S${index + 1}`,
        new Date().toLocaleString(),
        details.customer.name,
        details.customer.phone,
        item.id,
        item.name,
        item.quantity,
        item.price,
        item.quantity * item.price,
        details.paymentMethod,
        details.salesPerson,
      ]
    });

    const totalPurchase = items.reduce((total: number, item: item) => total + (item.quantity * item.price), 0);

    const customerRow = [[
      customerId,
      details.customer.name,
      details.customer.phone,
      undefined,
      totalPurchase
    ]]

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "Sales!A:N",
      valueInputOption: "USER_ENTERED",
      requestBody: { values: salesRows },
    });

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "Customer!A:E",
      valueInputOption: "USER_ENTERED",
      requestBody: { values: customerRow },
    })

    return NextResponse.json({
      success: true,
      transactionId,
      message: "Sale submitted successfully!",
    });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message });
  }
}
