import { NextRequest, NextResponse } from "next/server";
import { AppError } from "@/lib/utils/app-error";
import { processJobs } from "@/worker/jobRunner";

export async function GET(request: NextRequest) {
    try {
        const start = new Date().getTime();
        const secret = request.headers.get("Authorization");
        if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        await processJobs();
        const end = new Date().getTime();
        console.log(`Jobs processed successfully in ${end - start}ms`);
        return NextResponse.json({ message: "Jobs processed successfully" });
    } catch (error) {
        console.error("Error processing jobs:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to process jobs" },
            { status: error instanceof AppError ? error.status : 500 }
        );
    }
}