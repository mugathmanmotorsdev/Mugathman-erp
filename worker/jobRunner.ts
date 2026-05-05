import "dotenv/config";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Also load .env.local if it exists
const envLocalPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envLocalPath)) {
    dotenv.config({ path: envLocalPath });
}

import { Job } from "../generated/prisma/client";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/utils/send-email";
import { sendWhatsappThankMsg, uploadMedia } from "@/lib/services/whatsapp";
import { generateReceiptPDF } from "@/lib/pdf/generate-receipt-pdf";


function getBackoffDelay(retryCount: number): number {
    // Exponential backoff: 2^retryCount * 1 minute
    // 0 retries (1st failure) -> 2 mins
    // 1 retry (2nd failure) -> 4 mins
    // 2 retries (3rd failure) -> 8 mins
    const minutes = Math.pow(2, retryCount + 1);
    return minutes * 60 * 1000;
}

export async function processJobs() {
    try {
        const now = new Date();
        const jobs = await prisma.job.findMany({
            where: {
                status: { in: ["PENDING", "FAILED"] },
                scheduledAt: { lte: now }
            },
            take: 2,
            orderBy: { createdAt: "asc" }
        });

        const activeJobs = jobs.filter((job: Job) =>
            job.status === "PENDING" || job.retryCount < job.maxRetries
        );

        for (const job of activeJobs) {
            try {
                // Update job to processing
                await prisma.job.update({
                    where: { id: job.id },
                    data: { status: "PROCESSING" }
                });

                // Execute the job based on type
                const data = job.payload as any;

                switch (job.type) {
                    case "SEND_ACTIVATION_EMAIL":
                    case "SEND_RESET_PASSWORD_EMAIL": {
                        if (!data?.email) throw new Error("Job payload is missing recipient email");

                        console.log(`Sending ${job.type} to ${data.email}...`);
                        const { error } = await sendEmail(data.email, data.subject || "Security Alert", data.html || "");
                        if (error) throw new Error(`Failed to send email: ${JSON.stringify(error)}`);
                        break;
                    }

                    case "GENERATE_RECEIPT_PDF_AND_SEND_WHATSAPP": {
                        console.log("Generating receipt PDF and sending WhatsApp message...: ", data.id);
                        // This the sale job worker
                        // generate pdf
                        const sale = await prisma.sale.findUnique({
                            where: { id: data.id },
                            include: {
                                customer: true,
                                user: true,
                                sale_items: {
                                    include: {
                                        product: true,
                                    },
                                },
                            },
                        });

                        if (!sale) {
                            throw new Error("Sale not found");
                        }
                        
                        const pdfBuffer = await generateReceiptPDF(sale as any);

                        // upload pdf to whatsapp
                        const media = await uploadMedia(pdfBuffer);
                        if (!media?.id) {
                            throw new Error("Failed to upload receipt to WhatsApp: No media ID returned.");
                        }

                        // send whatsapp thank message
                        await sendWhatsappThankMsg(
                            data.fullName || "",
                            data.phone || "",
                            data.salesNumber || "",
                            data.totalAmount || 0,
                            media.id,
                        );

                        break;
                    }

                    default:
                        console.warn(`Unknown job type: ${job.type}`);
                    // Optionally mark as failed or ignore
                }

                // Mark job as completed
                await prisma.job.update({
                    where: { id: job.id },
                    data: { status: "COMPLETED" }
                });

                console.log(`Successfully completed job: ${job.id}`);

            } catch (error) {
                console.error(`Error processing job ${job.id}:`, error);

                const newRetryCount = job.retryCount + 1;
                const hasMoreRetries = newRetryCount < job.maxRetries;
                const nextScheduledAt = hasMoreRetries
                    ? new Date(Date.now() + getBackoffDelay(job.retryCount))
                    : job.scheduledAt;

                await prisma.job.update({
                    where: { id: job.id },
                    data: {
                        status: "FAILED",
                        retryCount: newRetryCount,
                        lastError: error instanceof Error ? error.message : String(error),
                        scheduledAt: nextScheduledAt
                    }
                });
            }
        }
    } catch (error) {
        console.error("Critical error in job runner:", error);
    }
}

// console.log("Job runner started...");
// processJobs();
