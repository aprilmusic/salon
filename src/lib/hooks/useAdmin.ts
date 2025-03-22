import { useState, useEffect } from 'react';

export function useAdmin() {
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        // Check admin status on mount
        fetch('/api/check-admin')
            .then(res => res.json())
            .then(data => setIsAdmin(data.isAdmin))
            .catch(() => setIsAdmin(false));
    }, []);

    const grantAdmin = async () => {
        try {
            await fetch('/api/dont-visit');
            setIsAdmin(true);
        } catch (error) {
            console.error('Failed to grant admin access:', error);
        }
    };

    const revokeAdmin = async () => {
        try {
            // Clear the cookie by setting maxAge to 0
            document.cookie = 'admin_token=; path=/; max-age=0';
            setIsAdmin(false);
        } catch (error) {
            console.error('Failed to revoke admin access:', error);
        }
    };

    return { isAdmin, grantAdmin, revokeAdmin };
} 