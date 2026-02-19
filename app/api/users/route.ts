import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { roleGuard, setActivationToken, requireAuth } from "@/lib/utils/auth-utils";
import { activationEmailHTML } from "@/components/email-template/activationEmailTemplateHtml";
import { generatePassword } from "@/lib/utils/password-generator";
import { hashPassword } from "@/lib/utils/password";
import { userCreateSchema } from "@/lib/validatoion/user";
import { sendEmail } from "@/lib/utils/send-email";


export async function POST(request: NextRequest) {
    try {
        // Require auth
        const user = await requireAuth()
        // Require admin role
        roleGuard(user, ["ADMIN"])
        // get request data
        const userData = await request.json()

        // Validate request data
        const validation = userCreateSchema.safeParse(userData)
        if (!validation.success) {
            return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
        }

        // Check if user already exists
        const userExists = await prisma.user.findUnique({
            where: {
                email: userData.email
            }
        })

        if (userExists) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }

        // Generate and hash temprary password
        const password = generatePassword(10);
        const hashedPassword = await hashPassword(password)

        // Create a new user
        const newUser = await prisma.user.create({
            data: {
                full_name: userData.name,
                email: userData.email,
                role: userData.role,
                password: hashedPassword
            }
        })

        // Generate and set reset password to new user
        // Because the new user was been assign by temprary default password
        const token = await setActivationToken(newUser)

        // Send action email to new user
        const emailHTML = activationEmailHTML(newUser.full_name, token.token)
        const { error } = await sendEmail(newUser.email, 'Activate your account', emailHTML)

        if (error) {
            return NextResponse.json({ error: error }, { status: 500 });
        }

        return NextResponse.json({ user: newUser, token }, { status: 201 });
    } catch (error) {
        console.error("Error creating user:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Something went wrong from our side" },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    // Get skip and take query param for pagination
    const searchParams = request.nextUrl.searchParams
    const skip = searchParams.get("skip")
    const take = searchParams.get("take")

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

        return NextResponse.json({ users }, { status: 200 });
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Something went wrong from our side" },
            { status: 500 }
        );
    }
}

