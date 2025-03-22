import { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';

const ADMIN_COOKIE_NAME = 'admin_token';
const ADMIN_COOKIE_VALUE = process.env.ADMIN_SECRET || 'your-secure-secret-here';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const existingCookie = req.cookies[ADMIN_COOKIE_NAME];

    if (existingCookie === ADMIN_COOKIE_VALUE) {
        // Remove admin access by setting maxAge to 0
        res.setHeader('Set-Cookie', serialize(ADMIN_COOKIE_NAME, '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 0
        }));
    } else {
        // Grant admin access
        res.setHeader('Set-Cookie', serialize(ADMIN_COOKIE_NAME, ADMIN_COOKIE_VALUE, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 60 * 60 * 24 * 7 // 1 week
        }));
    }

    // Return a deceptive message
    return res.status(200).json({
        message: 'Nothing to see here...',
        timestamp: new Date().toISOString()
    });
} 