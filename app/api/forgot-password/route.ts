import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateToken } from "@/lib/utils/token-generator";
import { resend } from "@/lib/resend";
import { resetPasswordEmailHTML } from "@/components/email-template/resetPasswordEmailTemplateHtml";

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

        const token = generateToken()
        const tokenRow = await prisma.resetPasswordToken.create({
            data: {
                user_id: user.id,
                token: token,
                expired_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
            }
        })
        console.log("token created: ", tokenRow)

        const { data: emailData, error } = await resend.emails.send({
            from: "Welcome <noreply@mugathmanmotors.com>",
            to: [user.email],
            subject: 'Reset your password',
            html: resetPasswordEmailHTML(user.full_name, tokenRow.token)
        })
        console.log("Error sending email: ", error)
        console.log("Email sent successfully", emailData)

        return NextResponse.json({ user, token }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}
