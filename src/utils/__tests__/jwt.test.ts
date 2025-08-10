import { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken, generateTokens } from '../jwt';
import { User } from '../../models/types';

// Mock environment variables
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.REFRESH_TOKEN_SECRET = 'test-refresh-secret';

describe('JWT Utilities', () => {
  const mockUser: Omit<User, 'password_hash'> = {
    id: 'test-user-id',
    email: 'test@example.com',
    first_name: 'Test',
    last_name: 'User',
    affiliation: 'Test University',
    role: 'author',
    created_at: new Date(),
    updated_at: new Date(),
  };

  describe('generateAccessToken', () => {
    it('should generate a valid access token', () => {
      const payload = {
        userId: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      };

      const token = generateAccessToken(payload);
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid refresh token', () => {
      const payload = {
        userId: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      };

      const token = generateRefreshToken(payload);
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify a valid access token', () => {
      const payload = {
        userId: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      };

      const token = generateAccessToken(payload);
      const decoded = verifyAccessToken(token);

      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
    });

    it('should throw error for invalid token', () => {
      expect(() => {
        verifyAccessToken('invalid-token');
      }).toThrow('Invalid or expired access token');
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify a valid refresh token', () => {
      const payload = {
        userId: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      };

      const token = generateRefreshToken(payload);
      const decoded = verifyRefreshToken(token);

      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
    });

    it('should throw error for invalid refresh token', () => {
      expect(() => {
        verifyRefreshToken('invalid-token');
      }).toThrow('Invalid or expired refresh token');
    });
  });

  describe('generateTokens', () => {
    it('should generate both access and refresh tokens', () => {
      const tokens = generateTokens(mockUser);

      expect(tokens).toHaveProperty('accessToken');
      expect(tokens).toHaveProperty('refreshToken');
      expect(typeof tokens.accessToken).toBe('string');
      expect(typeof tokens.refreshToken).toBe('string');

      // Verify tokens are valid
      const accessDecoded = verifyAccessToken(tokens.accessToken);
      const refreshDecoded = verifyRefreshToken(tokens.refreshToken);

      expect(accessDecoded.userId).toBe(mockUser.id);
      expect(refreshDecoded.userId).toBe(mockUser.id);
    });
  });
});