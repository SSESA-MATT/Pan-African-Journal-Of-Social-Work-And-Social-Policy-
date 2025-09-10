import { NextResponse } from 'next/server';

// Add CORS headers
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

export async function GET() {
  return NextResponse.json({ 
    status: 'healthy', 
    message: 'Pan-African Journal API is running',
    timestamp: new Date().toISOString()
  }, { headers: corsHeaders() });
}
