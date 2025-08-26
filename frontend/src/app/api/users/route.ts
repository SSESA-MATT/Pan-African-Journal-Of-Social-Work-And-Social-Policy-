import { NextRequest, NextResponse } from 'next/server';

// Temporary implementation for deployment
export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'Users API - Not implemented yet' }, { status: 501 });
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ message: 'Users API - Not implemented yet' }, { status: 501 });
}

export async function PUT(request: NextRequest) {
  return NextResponse.json({ message: 'Users API - Not implemented yet' }, { status: 501 });
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json({ message: 'Users API - Not implemented yet' }, { status: 501 });
}
