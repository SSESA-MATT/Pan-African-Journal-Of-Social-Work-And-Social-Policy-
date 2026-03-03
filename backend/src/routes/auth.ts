import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import https from 'https';
import { z } from 'zod';
import User from '../models/User';
import config from '../config';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { uploadProfilePicture, handleUploadError } from '../middleware/upload';
import cloudinary from '../config/cloudinary';
import emailService from '../services/email-service';

const router = Router();

// ─── Helper: JSON HTTPS request ──────────────────────────────
function httpsRequest(url: string, options: https.RequestOptions = {}, body?: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const reqOptions: https.RequestOptions = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      ...options,
    };
    const req = https.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch { resolve(data); }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

// ─── Helper: Serialize user for API responses ─────────────────
function serializeUser(user: any) {
  return {
    id: user.id || user._id,
    email: user.email,
    first_name: user.firstName,
    last_name: user.lastName,
    affiliation: user.affiliation,
    role: user.role,
    expertise: user.expertise,
    bio: user.bio,
    orcid: user.orcid,
    profile_picture: user.profilePicture?.url || null,
    created_at: user.createdAt,
    updated_at: user.updatedAt,
  };
}

// ─── Validation Schemas ───────────────────────────────────────
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  affiliation: z.string().optional().default(''),
  role: z.enum(['author', 'reviewer']).optional().default('author'),
  expertise: z.array(z.string()).optional().default([]),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// ─── Helper: Generate tokens ─────────────────────────────────
function generateTokens(userId: string, email: string, role: string) {
  const token = jwt.sign({ userId, email, role }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as string,
  } as jwt.SignOptions);
  const refreshToken = jwt.sign({ userId, email, role }, config.jwtRefreshSecret, {
    expiresIn: config.jwtRefreshExpiresIn as string,
  } as jwt.SignOptions);
  return { token, refreshToken };
}

// ─── POST /api/auth/register ──────────────────────────────────
router.post('/register', validate(registerSchema), async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, affiliation, role, expertise } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({ error: 'An account with this email already exists.' });
      return;
    }

    // Create user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      affiliation,
      role,
      expertise,
    });

    const tokens = generateTokens(user.id, user.email, user.role);

    // Send welcome email (non-blocking)
    emailService.sendWelcome(email, firstName).catch(() => {});

    res.status(201).json({
      user: serializeUser(user),
      token: tokens.token,
      refresh_token: tokens.refreshToken,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    if (error.code === 11000) {
      res.status(409).json({ error: 'An account with this email already exists.' });
      return;
    }
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// ─── POST /api/auth/login ─────────────────────────────────────
router.post('/login', validate(loginSchema), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user with password included
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({ error: 'Your account has been deactivated. Please contact support.' });
      return;
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const tokens = generateTokens(user.id, user.email, user.role);

    res.json({
      user: serializeUser(user),
      token: tokens.token,
      refresh_token: tokens.refreshToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// ─── POST /api/auth/refresh ───────────────────────────────────
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({ error: 'Refresh token is required.' });
      return;
    }

    const decoded = jwt.verify(refreshToken, config.jwtRefreshSecret) as any;
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      res.status(401).json({ error: 'Invalid refresh token.' });
      return;
    }

    const tokens = generateTokens(user.id, user.email, user.role);

    res.json({
      token: tokens.token,
      refresh_token: tokens.refreshToken,
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired refresh token.' });
  }
});

// ─── GET /api/auth/profile ────────────────────────────────────
router.get('/profile', authenticate, async (req: Request, res: Response) => {
  res.json({
    user: serializeUser(req.user!),
  });
});

// ─── PUT /api/auth/profile ────────────────────────────────────
router.put('/profile', authenticate, async (req: Request, res: Response) => {
  try {
    const allowedFields = ['firstName', 'lastName', 'affiliation', 'bio', 'orcid', 'expertise'];
    const updates: Record<string, any> = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const user = await User.findByIdAndUpdate(req.userId, updates, { new: true, runValidators: true });
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    res.json({
      user: serializeUser(user),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// ─── POST /api/auth/logout ────────────────────────────────────
router.post('/logout', authenticate, (_req: Request, res: Response) => {
  // JWT is stateless — client should discard the token
  res.json({ message: 'Logged out successfully.' });
});

// ─── PUT /api/auth/change-password ────────────────────────────
router.put('/change-password', authenticate, async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: 'Current password and new password are required.' });
      return;
    }
    if (newPassword.length < 8) {
      res.status(400).json({ error: 'New password must be at least 8 characters.' });
      return;
    }

    const user = await User.findById(req.userId).select('+password');
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      res.status(401).json({ error: 'Current password is incorrect.' });
      return;
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to change password.' });
  }
});

// ─── PUT /api/auth/profile/avatar ─────────────────────────────
router.put('/profile/avatar', authenticate, uploadProfilePicture, handleUploadError, async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No image file provided.' });
      return;
    }

    const user = await User.findById(req.userId);
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    // Delete old avatar from Cloudinary if one exists
    if (user.profilePicture?.publicId) {
      await cloudinary.uploader.destroy(user.profilePicture.publicId).catch(() => {});
    }

    // Upload new avatar to Cloudinary
    const result: any = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'pan-afri-journal/avatars',
          public_id: `avatar-${user.id}-${Date.now()}`,
          transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' },
            { quality: 'auto', fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error || !result) reject(error || new Error('Upload failed'));
          else resolve(result);
        }
      );
      const { Readable } = require('stream');
      const readable = new Readable();
      readable.push(req.file!.buffer);
      readable.push(null);
      readable.pipe(stream);
    });

    user.profilePicture = {
      url: result.secure_url,
      publicId: result.public_id,
    };
    await user.save();

    res.json({
      user: serializeUser(user),
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ error: 'Failed to upload profile picture.' });
  }
});

// ─── DELETE /api/auth/profile/avatar ──────────────────────────
router.delete('/profile/avatar', authenticate, async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    // Delete from Cloudinary
    if (user.profilePicture?.publicId) {
      await cloudinary.uploader.destroy(user.profilePicture.publicId).catch(() => {});
    }

    user.profilePicture = { url: '', publicId: '' };
    await user.save();

    res.json({
      user: serializeUser(user),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove profile picture.' });
  }
});

// ─── GET /api/auth/validate ───────────────────────────────────
router.get('/validate', authenticate, (_req: Request, res: Response) => {
  res.json({ valid: true });
});

// ─── GET /api/auth/github ─────────────────────────────────────
router.get('/github', (_req: Request, res: Response) => {
  if (!config.githubClientId) {
    res.status(503).json({ error: 'GitHub OAuth is not configured.' });
    return;
  }
  const params = new URLSearchParams({
    client_id: config.githubClientId,
    redirect_uri: `${config.apiUrl}/api/auth/github/callback`,
    scope: 'user:email',
  });
  res.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
});

// ─── GET /api/auth/github/callback ───────────────────────────
router.get('/github/callback', async (req: Request, res: Response) => {
  const frontendUrl = config.frontendUrl;
  try {
    const { code } = req.query;
    if (!code || typeof code !== 'string') {
      res.redirect(`${frontendUrl}/login?error=github_oauth_failed`);
      return;
    }

    // Exchange code for access token
    const tokenData = await httpsRequest(
      'https://github.com/login/oauth/access_token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      },
      JSON.stringify({
        client_id: config.githubClientId,
        client_secret: config.githubClientSecret,
        code,
      })
    );

    const accessToken = tokenData.access_token;
    if (!accessToken) {
      res.redirect(`${frontendUrl}/login?error=github_oauth_failed`);
      return;
    }

    // Get GitHub user info
    const githubUser: any = await httpsRequest('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'PanAfriJournal',
        Accept: 'application/vnd.github.v3+json',
      },
    });

    // Get primary verified email if not public on profile
    let email: string = githubUser.email;
    if (!email) {
      const emails: any[] = await httpsRequest('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'User-Agent': 'PanAfriJournal',
          Accept: 'application/vnd.github.v3+json',
        },
      });
      const primary = Array.isArray(emails) ? emails.find((e) => e.primary && e.verified) : null;
      email = primary?.email;
    }

    if (!email) {
      res.redirect(`${frontendUrl}/login?error=github_no_email`);
      return;
    }

    // Find or create user
    let user = await User.findOne({ $or: [{ githubId: String(githubUser.id) }, { email }] });

    if (user) {
      if (!user.githubId) {
        user.githubId = String(githubUser.id);
        await user.save();
      }
    } else {
      const nameParts = ((githubUser.name as string) || (githubUser.login as string) || '')
        .split(' ')
        .filter(Boolean);
      user = await User.create({
        email,
        githubId: String(githubUser.id),
        firstName: nameParts[0] || (githubUser.login as string) || 'GitHub',
        lastName: nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'User',
        affiliation: (githubUser.company as string) || '',
        role: 'author',
        bio: (githubUser.bio as string) || '',
        profilePicture: githubUser.avatar_url
          ? { url: githubUser.avatar_url as string, publicId: '' }
          : { url: '', publicId: '' },
      });
    }

    if (!user.isActive) {
      res.redirect(`${frontendUrl}/login?error=account_deactivated`);
      return;
    }

    user.lastLogin = new Date();
    await user.save();

    const tokens = generateTokens(user.id, user.email, user.role);
    const params = new URLSearchParams({
      token: tokens.token,
      refresh_token: tokens.refreshToken,
    });
    res.redirect(`${frontendUrl}/auth/callback?${params.toString()}`);
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    res.redirect(`${frontendUrl}/login?error=github_oauth_failed`);
  }
});

export default router;
