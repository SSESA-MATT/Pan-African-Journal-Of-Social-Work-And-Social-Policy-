import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/server/AuthService';
import { LoginRequest } from '@/types/api';

const authService = new AuthService();

export async function POST(request: NextRequest) {
  try {
    const loginData: LoginRequest = await request.json();
    
    const result = await authService.login(loginData);
    
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('Login error:', error);
    
    if (error.message === 'Invalid credentials') {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    if (error.message === 'Account not verified') {
      return NextResponse.json(
        { error: 'Please verify your email before logging in' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
