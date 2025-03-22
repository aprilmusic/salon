import { NextApiRequest, NextApiResponse } from 'next';
import { parse } from 'cookie';

const ADMIN_COOKIE_NAME = 'admin_token';
const ADMIN_COOKIE_VALUE = process.env.ADMIN_SECRET || 'your-secure-secret-here';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const cookies = parse(req.headers.cookie || '');
    const adminToken = cookies[ADMIN_COOKIE_NAME];

    return res.status(200).json({
        isAdmin: adminToken === ADMIN_COOKIE_VALUE
    });
} 