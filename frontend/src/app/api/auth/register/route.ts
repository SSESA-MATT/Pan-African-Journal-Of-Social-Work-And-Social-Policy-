import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/server/AuthService';
import { CreateUserRequest } from '@/types/api';

const authService = new AuthService();

export async function POST(request: NextRequest) {
  try {
    const userData: CreateUserRequest = await request.json();
    
    const result = await authService.register(userData);
    
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Registration error:', error);
    
    if (error.message === 'User already exists') {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}
