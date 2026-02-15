import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { roleGuard, setActivationToken, requireAuth } from "@/lib/utils/auth-utils";
import { activationEmailHTML } from "@/components/email-template/activationEmailTemplateHtml";
import { generatePassword } from "@/lib/utils/password-generator";
import { resend } from "@/lib/resend";
import { hashPassword } from "@/lib/utils/password";
import { userCreateSchema } from "@/lib/validatoion/user";



export async function POST(request: NextRequest) {
    try {
        // require auth
        const user = await requireAuth()
        // require admin role
        roleGuard(user, ["ADMIN"])
        // get request data
        const userData = await request.json()

        // validate request data
        const validation = userCreateSchema.safeParse(userData)
        if (!validation.success) {
            return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
        }
        
        const password = generatePassword(10);
        const hashedPassword = await hashPassword(password)

        //check if user already exists
        const userExists = await prisma.user.findUnique({
            where: {
                email: userData.email
            }
        })

        if (userExists) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }

        const newUser = await prisma.user.create({
            data: {
                full_name: userData.name,
                email: userData.email,
                role: userData.role,
                password: hashedPassword
            }
        })

        const token = await setActivationToken(newUser)
    
        await resend.emails.send({
            from: "Welcome <noreply@mugathmanmotors.com>",
            to: [newUser.email],
            subject: 'Activate your account',
            html: activationEmailHTML(newUser.full_name, token.token)
        })

        return NextResponse.json({ user: newUser, token }, { status: 201 });
    } catch (error) {
        console.error("Error creating user:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const skip = searchParams.get("skip")
    const take = searchParams.get("take")
    console.log("Skip: ", skip)
    console.log("Take: ", take)

    try {
        const user = await requireAuth()
        roleGuard(user, ["ADMIN"])
        const users = await prisma.user.findMany({
            select: {
                id: true,
                full_name: true,
                email: true,
                role: true,
                status: true,
                created_at: true,
            },
            skip: skip ? parseInt(skip) : 0,
            take: take ? parseInt(take) : 100,
        })

        console.log("Users list: ", users)
        return NextResponse.json({ users }, { status: 200 });
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Internal Server Error" },
            { status: 500 }
        );
    }
}

