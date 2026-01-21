import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { setActivationToken } from "@/lib/authutils";
import { activationEmailHTML } from "@/components/email-template/activationEmailTemplateHtml";
import { generatePassword } from "@/lib/utils/password-generator";
import { resend } from "@/lib/resend";
import { hashPassword } from "@/lib/utils/password";


export async function POST(request: NextRequest) {
    const userData = await request.json()
    if (!userData.name || !userData.email || !userData.role) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    try {
        const password = generatePassword(10);
        const hashedPassword = await hashPassword(password)

        const user = await prisma.user.create({
            data: {
                full_name: userData.name,
                email: userData.email,
                role: userData.role,
                password: hashedPassword
            }
        })

        const token = await setActivationToken(user)
    
        const { data, error } = await resend.emails.send({
            from: "Welcome <noreply@mugathmanmotors.com>",
            to: [user.email],
            subject: 'Activate your account',
            html: activationEmailHTML(user.full_name, token.token)
        })

        return NextResponse.json({ user, token }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}
