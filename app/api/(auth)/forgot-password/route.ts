import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { resetPasswordEmailHTML } from "@/components/email-template/resetPasswordEmailTemplateHtml";
import { setResetPasswordToken } from "@/lib/utils/auth-utils";

export async function POST(request: NextRequest) {
    try {
        // Get the request body
        const data = await request.json()
        // Check for email
        if (!data.email) {
            return NextResponse.json({ error: "Missing email" }, { status: 400 });
        }

        // Try look for user
        const user = await prisma.user.findUnique({
            where: {
                email: data.email
            }
        })
        // If user not found respond with 404 user not found
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Generate and set reset password token
        const token = await setResetPasswordToken(user)

        // Send reset password email to user via background job
        const emailHTML = resetPasswordEmailHTML(user.full_name, token.token)
        await prisma.job.create({
            data: {
                type: "SEND_RESET_PASSWORD_EMAIL",
                payload: { email: user.email, subject: 'Reset your password', html: emailHTML },
                maxRetries: 5
            }
        })

        return NextResponse.json({ message: "Password reset email scheduled for sending" }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}
