import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { resend } from "@/lib/resend";
import { resetPasswordEmailHTML } from "@/components/email-template/resetPasswordEmailTemplateHtml";
import { setResetPasswordToken } from "@/lib/utils/auth-utils";

export async function POST(request: NextRequest) {
    const data = await request.json()
    if (!data.email) {
        return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: {
                email: data.email
            }
        })
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const token = await setResetPasswordToken(user)

        const { data: emailData, error } = await resend.emails.send({
            from: "Welcome <noreply@mugathmanmotors.com>",
            to: [user.email],
            subject: 'Reset your password',
            html: resetPasswordEmailHTML(user.full_name, token.token)
        })

        if (error) {
            return NextResponse.json({ error: error }, { status: 500 });
        }

        return NextResponse.json({ message: "Password reset email sent successfully" }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}
