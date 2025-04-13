import { NextResponse } from 'next/server';

// In a real application, these would be stored in a database with expiration times
const otpStorage: Record<string, { otp: string; expiresAt: number }> = {};

export async function POST(request: Request) {
  try {
    const { phone } = await request.json();
    
    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with 10-minute expiration
    const expiresAt = Date.now() + 600000; // 10 minutes
    otpStorage[phone] = { otp, expiresAt };
    
    // In a real application, you would send this OTP via SMS using a service like Twilio
    console.log(`[MOCK SMS] Your OTP is: ${otp}`);
    
    return NextResponse.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error generating OTP:', error);
    return NextResponse.json(
      { error: 'Failed to generate OTP' },
      { status: 500 }
    );
  }
}

// For development/testing purposes, expose the OTP storage
// This would be removed in production
export function GET(request: Request) {
  const url = new URL(request.url);
  const phone = url.searchParams.get('phone');
  
  if (!phone || !otpStorage[phone]) {
    return NextResponse.json(
      { error: 'No OTP found for this phone number' },
      { status: 404 }
    );
  }
  
  return NextResponse.json({ 
    phone, 
    otp: otpStorage[phone].otp,
    expiresAt: otpStorage[phone].expiresAt
  });
}

// Function to verify OTP (would be used by the [...nextauth]/route.ts file)
export function verifyOTP(phone: string, otp: string): boolean {
  const storedData = otpStorage[phone];
  
  if (!storedData) {
    return false;
  }
  
  if (Date.now() > storedData.expiresAt) {
    // OTP has expired
    delete otpStorage[phone];
    return false;
  }
  
  if (storedData.otp !== otp) {
    return false;
  }
  
  // OTP is valid, remove it to prevent reuse
  delete otpStorage[phone];
  return true;
} 