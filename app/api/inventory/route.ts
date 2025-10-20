import { requireAuth } from "@/lib/authutils";
import { googleAuth } from "@/lib/googleAuth";
import { google } from "googleapis";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await requireAuth();
    const auth = await googleAuth("https://www.googleapis.com/auth/spreadsheets.readonly")

    const sheets = google.sheets({ version: "v4", auth });

    const spreadsheetId = process.env.GOOGLE_SHEET_ID; // from the URL
    const range = "Inventory!A2:F"; // range of your data

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values || [];

    // Convert rows to objects for easier use in your frontend
    const inventory = rows.map((row) => ({
      id: row[0],
      name: row[1],
      stock: Number(row[2] || 0),
      price: Number(row[3] || 0),
      category: row[4],
      lastUpdated: row[5],
    }));

    return NextResponse.json({ success: true, data: inventory });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message });
  }
}
