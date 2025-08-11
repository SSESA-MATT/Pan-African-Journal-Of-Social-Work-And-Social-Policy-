import { NextRequest } from 'next/server';
import { AuthService } from './AuthService';
import { User } from '@/types/api';

const authService = new AuthService();

export async function verifyAuth(request: NextRequest): Promise<User | null> {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    
    const token = authHeader.substring(7);
    const user = await authService.validateToken(token);
    
    return user;
  } catch (error) {
    console.error('Auth verification error:', error);
    return null;
  }
}

export function requireAuth(allowedRoles?: string[]) {
  return async (request: NextRequest): Promise<{ user: User | null; error?: string }> => {
    const user = await verifyAuth(request);
    
    if (!user) {
      return { user: null, error: 'Unauthorized' };
    }
    
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return { user: null, error: 'Forbidden' };
    }
    
    return { user };
  };
}
