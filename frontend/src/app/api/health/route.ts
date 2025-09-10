import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    status: 'healthy', 
    message: 'Pan-African Journal API is running',
    timestamp: new Date().toISOString()
  });
}
