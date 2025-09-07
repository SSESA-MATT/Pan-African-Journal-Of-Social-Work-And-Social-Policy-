// Temporary implementation for deployment
// Using standard Request/Response instead of Next.js types to avoid dependency issues

export async function GET(request: Request) {
  return new Response(
    JSON.stringify({ message: 'Reviews API - Not implemented yet' }), 
    { 
      status: 501,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

export async function POST(request: Request) {
  return new Response(
    JSON.stringify({ message: 'Reviews API - Not implemented yet' }), 
    { 
      status: 501,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}
