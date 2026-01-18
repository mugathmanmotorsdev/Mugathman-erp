import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Role } from "@/generated/prisma/enums";

function generatePassword(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        password += characters.charAt(randomIndex);
    }
    return password;
}

export async function POST({userInput}: {userInput: {
    name?: string
    email?: string
    role?: Role
}}) {
    if (!userInput.name || !userInput.email || !userInput.role) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const password = generatePassword(10);
    const user = await prisma.user.create({
        data: {
            full_name: userInput.name,
            email: userInput.email,
            role: userInput.role,
            password: password
        }
    })

    return NextResponse.json({ user }, { status: 201 });
}
