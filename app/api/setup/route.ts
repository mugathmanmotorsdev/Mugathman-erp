import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/password';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { full_name, email, password } = body;

    // Validate input
    if (!full_name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Password strength validation
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Check if any user already exists (setup should only run once)
    const existingUsers = await prisma.user.count();
    if (existingUsers > 0) {
      return NextResponse.json(
        { success: false, error: 'Setup has already been completed. Manager account exists.' },
        { status: 403 }
      );
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Create the manager user
    const manager = await prisma.user.create({
      data: {
        full_name,
        email,
        password: hashedPassword,
        role: 'MANAGER',
        is_active: true,
      },
      select: {
        id: true,
        full_name: true,
        email: true,
        role: true,
        created_at: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Manager account created successfully',
        data: manager,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Setup error:', error);
    
    // Handle unique constraint violation (duplicate email)
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { success: false, error: 'Email already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to check if setup is needed
export async function GET() {
  try {
    const userCount = await prisma.user.count();
    
    return NextResponse.json({
      success: true,
      setupRequired: userCount === 0,
      message: userCount === 0 
        ? 'Setup is required' 
        : 'Setup already completed',
    });
  } catch (error) {
    console.error('Setup check error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check setup status' },
      { status: 500 }
    );
  }
}
