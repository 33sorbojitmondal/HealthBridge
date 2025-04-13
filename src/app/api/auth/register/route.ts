import { NextResponse } from 'next/server';

// This is a mock implementation for demo purposes
// In a real app, you would store the user in a database
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name, email, password } = data;
    
    // Check if required fields are provided
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Simple validation
    if (password.length < 8) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }
    
    // In a real app, you would:
    // 1. Check if email already exists in your database
    // 2. Hash the password
    // 3. Store the user in your database
    
    // Mock successful response
    return NextResponse.json(
      { 
        success: true, 
        message: 'User registered successfully',
        user: { name, email }
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'An error occurred during registration' },
      { status: 500 }
    );
  }
} 